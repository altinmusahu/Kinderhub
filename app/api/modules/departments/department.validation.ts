import { z } from "zod"

export const createDepartmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tenant_id: z.string().min(1, "tenant is required"),
  location_id: z.string().min(1, "Location is required"),
})

export const updateDepartmentSchema = createDepartmentSchema.partial()

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>
