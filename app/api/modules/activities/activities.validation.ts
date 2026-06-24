import { z } from "zod"

export const createActivitiesSchema = z.object({
    executor_id: z.string().min(1, "Executor is required"),
    activity: z.string().min(1, "Activity is required"),
    tenant_id: z.string().min(1, "Tenant is required")
})

export const updateActivitiesSchema = createActivitiesSchema.partial()

export type CreateActivitiesInput = z.infer<typeof createActivitiesSchema>
export type UpdateActivitiesInput = z.infer<typeof updateActivitiesSchema>