import { supabaseAdmin } from "@/lib/supabase-admin"
import type { User, CreateUserDto, UpdateUserDto, UserWithWorkTrackingAndDepartment, UserById } from "./user.types"

export const UserRepository = {
  // GET
  async findAll(tenantId: string): Promise<User[]> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
    if (error) throw new Error(error.message)
    return data
  },

  async findById(id: string, tenantId: string): Promise<UserById | null> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select(`
        *,
        tenants (
          name
        ),
        work_tracking!work_tracking_user_id_fkey (
          position_name,
          end_date,
          department_id,
          responsible_user_id,
          start_date,
          department:departments (
            name
          )
        )
      `)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle()

    if (error) throw new Error(error.message)
      
    if (!data) return null

    // Pick the active work_tracking record (end_date is null), fall back to most recent
    const activeWt = data.work_tracking?.find((wt: any) => wt.end_date === null) ?? data.work_tracking?.[0] ?? null

    return {
      user: {
        id: data.id,
        name: data.name,
        lastname: data.lastname,
        phone_number: data.phone_number,
        personal_number: data.personal_number,
        role: data.role,
        created_at: data.created_at,
        is_active: data.is_active,
        date_of_birth: data.date_of_birth,
        tenant_id: data.tenant_id,
        email: data.email,
        is_first_login_executed: data.is_first_login_executed,
      },
      position_name: activeWt?.position_name ?? null,
      tenant_name: data.tenants?.name ?? null,
      department_name: activeWt?.department?.name ?? null,
      responsible_user_id: activeWt?.responsible_user_id ?? null,
      responsible_user_name: null,
      start_date: activeWt?.start_date ?? null,
    }
  },

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async findAllWithWorkTrackingAndDepartment(tenantId: string): Promise<UserWithWorkTrackingAndDepartment[]> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select(`
        id,
        name,
        lastname,
        phone_number,
        created_at,
        is_active,
        date_of_birth,
        email,
        work_tracking!work_tracking_user_id_fkey (
          department_id,
          department:departments (
            name
          ),
          position_name
        )
      `)
      .eq("tenant_id", tenantId)

    if (error) throw new Error(error.message)

    return (data ?? []).map((u) => {
      const wt = u.work_tracking?.[0]
      const dept = wt?.department?.[0]

      return {
        id: u.id,
        name: u.name,
        lastname: u.lastname,
        phone_number: u.phone_number,
        created_at: u.created_at,
        is_active: u.is_active,
        date_of_birth: u.date_of_birth,
        email: u.email,
        department_id: wt?.department_id ?? null,
        department_name: dept?.name ?? null,
        position_name: wt?.position_name ?? null,
      }
    })
  },

  // POST
  async create(payload: CreateUserDto): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async createWithId(payload: User): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  // PUT
  async update(id: string, tenantId: string, payload: UpdateUserDto): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .update(payload)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  // DELETE
  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}