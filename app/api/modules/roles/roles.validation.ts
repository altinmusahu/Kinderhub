import { z } from "zod"
import { isResourceKey } from "@/lib/permissions/resources"

export const createRoleSchema = z.object({
  tenant_id: z.string().min(1, "tenant is required"),
  name: z.string().min(1, "Name is required"),
  color: z.string().nullable().optional().default(null),
})

export const updateRoleSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  color: z.string().nullable().optional(),
})

export const permissionLevelSchema = z.enum(["none", "view", "edit", "full", "own_only"])

export const permissionInputSchema = z.object({
  resource: z.string().refine(isResourceKey, "Unknown resource"),
  level: permissionLevelSchema,
})

export const upsertPermissionsSchema = z.array(permissionInputSchema)

export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
export type UpsertPermissionsInput = z.infer<typeof upsertPermissionsSchema>
