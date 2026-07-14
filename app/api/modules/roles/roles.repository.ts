import { supabaseAdmin } from "@/lib/supabase-admin"
import type { CreateRoleDto, PermissionInput, Role, RolePermission, RoleWithPermissions, UpdateRoleDto } from "./roles.types"

export const RolesRepository = {
  async findAllForTenant(tenantId: string): Promise<RoleWithPermissions[]> {
    const { data, error } = await supabaseAdmin
      .from("roles")
      .select(`
        *,
        role_permissions ( id, tenant_id, role_id, resource, level, updated_at )
      `)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true })
    if (error) throw new Error(error.message)

    return (data ?? []).map((row) => ({
      id: row.id,
      tenant_id: row.tenant_id,
      name: row.name,
      color: row.color,
      is_system: row.is_system,
      is_owner_role: row.is_owner_role,
      created_at: row.created_at,
      permissions: (row.role_permissions ?? []) as RolePermission[],
    }))
  },

  async findById(id: string, tenantId: string): Promise<RoleWithPermissions | null> {
    const { data, error } = await supabaseAdmin
      .from("roles")
      .select(`
        *,
        role_permissions ( id, tenant_id, role_id, resource, level, updated_at )
      `)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return null

    return {
      id: data.id,
      tenant_id: data.tenant_id,
      name: data.name,
      color: data.color,
      is_system: data.is_system,
      is_owner_role: data.is_owner_role,
      created_at: data.created_at,
      permissions: (data.role_permissions ?? []) as RolePermission[],
    }
  },

  async findByName(name: string, tenantId: string): Promise<Role | null> {
    const { data, error } = await supabaseAdmin
      .from("roles")
      .select("*")
      .eq("tenant_id", tenantId)
      .ilike("name", name)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: CreateRoleDto, flags?: { is_system?: boolean; is_owner_role?: boolean }): Promise<Role> {
    const { data, error } = await supabaseAdmin
      .from("roles")
      .insert([{
        ...payload,
        is_system: flags?.is_system ?? false,
        is_owner_role: flags?.is_owner_role ?? false,
      }])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, tenantId: string, payload: UpdateRoleDto): Promise<Role> {
    const { data, error } = await supabaseAdmin
      .from("roles")
      .update(payload)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("roles")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },

  async countUsersWithRole(roleId: string, tenantId: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role_id", roleId)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
    return count ?? 0
  },

  async upsertPermissions(roleId: string, tenantId: string, permissions: PermissionInput[]): Promise<RolePermission[]> {
    const rows = permissions.map((p) => ({
      tenant_id: tenantId,
      role_id: roleId,
      resource: p.resource,
      level: p.level,
      updated_at: new Date().toISOString(),
    }))

    const { data, error } = await supabaseAdmin
      .from("role_permissions")
      .upsert(rows, { onConflict: "role_id,resource" })
      .select()
    if (error) throw new Error(error.message)
    return (data ?? []) as RolePermission[]
  },

  async createPermissionsForRole(roleId: string, tenantId: string, permissions: PermissionInput[]): Promise<void> {
    const rows = permissions.map((p) => ({
      tenant_id: tenantId,
      role_id: roleId,
      resource: p.resource,
      level: p.level,
    }))
    const { error } = await supabaseAdmin.from("role_permissions").insert(rows)
    if (error) throw new Error(error.message)
  },
}
