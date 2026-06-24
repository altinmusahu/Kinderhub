import { z } from "zod"

export const createFamiliesSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.string().min(1, "Status is required"),
  plan: z.string().min(1, "Plan is required"),
  balance: z.number(),
  tenant_id: z.string().min(1, "Tenant is required")
})

export const updateFamiliesSchema = createFamiliesSchema.partial()

export type CreateDepartmentInput = z.infer<typeof createFamiliesSchema>
export type UpdateDepartmentInput = z.infer<typeof updateFamiliesSchema>