import { z } from "zod"

export const createTenantSchema = z.object({
  Name: z.string().min(1, "Name is required"),
  Slug: z.string().min(1, "Slug is required"),
})

export const updateTenantSchema = createTenantSchema.partial()

export type CreateTenantInput = z.infer<typeof createTenantSchema>
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>