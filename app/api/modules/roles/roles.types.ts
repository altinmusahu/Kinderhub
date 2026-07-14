import type { PermissionLevel, ResourceKey } from "@/lib/permissions/resources"

export type Role = {
  id: string
  tenant_id: string
  name: string
  color: string | null
  is_system: boolean
  is_owner_role: boolean
  created_at: string
}

export type RolePermission = {
  id: string
  tenant_id: string
  role_id: string
  resource: ResourceKey
  level: PermissionLevel
  updated_at: string
}

export type RoleWithPermissions = Role & {
  permissions: RolePermission[]
}

export type CreateRoleDto = {
  tenant_id: string
  name: string
  color: string | null
}

export type UpdateRoleDto = {
  name?: string
  color?: string | null
}

export type PermissionInput = {
  resource: ResourceKey
  level: PermissionLevel
}
