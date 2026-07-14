import { DEFAULT_ROLES } from "@/lib/permissions/default-roles"
import { RolesRepository } from "./roles.repository"
import type { CreateRoleDto, PermissionInput, Role, RoleWithPermissions, UpdateRoleDto } from "./roles.types"

export const RolesService = {
  async getAllForTenant(tenantId: string): Promise<RoleWithPermissions[]> {
    return RolesRepository.findAllForTenant(tenantId)
  },

  async getById(id: string, tenantId: string): Promise<RoleWithPermissions> {
    const role = await RolesRepository.findById(id, tenantId)
    if (!role) throw new Error("Role not found")
    return role
  },

  async create(input: CreateRoleDto): Promise<Role> {
    const existing = await RolesRepository.findByName(input.name, input.tenant_id)
    if (existing) throw new Error("A role with this name already exists")
    return RolesRepository.create(input)
  },

  async update(id: string, tenantId: string, input: UpdateRoleDto): Promise<Role> {
    const role = await RolesService.getById(id, tenantId)
    if (role.is_owner_role) throw new Error("The Owner role can't be modified")

    if (input.name && input.name.toLowerCase() !== role.name.toLowerCase()) {
      const existing = await RolesRepository.findByName(input.name, tenantId)
      if (existing) throw new Error("A role with this name already exists")
    }

    return RolesRepository.update(id, tenantId, input)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    const role = await RolesService.getById(id, tenantId)
    if (role.is_owner_role) throw new Error("The Owner role can't be deleted")
    if (role.is_system) throw new Error("System roles can't be deleted")

    const usersCount = await RolesRepository.countUsersWithRole(id, tenantId)
    if (usersCount > 0) throw new Error("This role is still assigned to one or more staff members")

    return RolesRepository.delete(id, tenantId)
  },

  async upsertPermissions(id: string, tenantId: string, permissions: PermissionInput[]): Promise<RoleWithPermissions> {
    const role = await RolesService.getById(id, tenantId)
    if (role.is_owner_role) throw new Error("The Owner role's permissions can't be modified")

    await RolesRepository.upsertPermissions(id, tenantId, permissions)
    return RolesService.getById(id, tenantId)
  },

  async seedDefaultRoles(tenantId: string): Promise<void> {
    for (const defaultRole of DEFAULT_ROLES) {
      const role = await RolesRepository.create(
        { tenant_id: tenantId, name: defaultRole.name, color: defaultRole.color },
        { is_system: defaultRole.is_system, is_owner_role: defaultRole.is_owner_role }
      )
      const permissions: PermissionInput[] = Object.entries(defaultRole.permissions).map(([resource, level]) => ({
        resource: resource as PermissionInput["resource"],
        level,
      }))
      await RolesRepository.createPermissionsForRole(role.id, tenantId, permissions)
    }
  },
}
