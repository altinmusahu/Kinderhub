import { z } from "zod"

export const createSubscriptionPlanSchema = z.object({
  code: z.string().min(1, "Code is required"),
  Name: z.string().min(1, "Name is required"),
  yearly_price: z.number().positive("Yearly price must be a positive number"),
  isActive: z.boolean(),
})

export const updateSubscriptionPlanSchema = createSubscriptionPlanSchema.partial()

export type CreateSubscriptionPlanInput = z.infer<typeof createSubscriptionPlanSchema>
export type UpdateSubscriptionPlanInput = z.infer<typeof updateSubscriptionPlanSchema>
