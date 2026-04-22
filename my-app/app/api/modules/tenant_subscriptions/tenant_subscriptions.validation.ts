import { z } from "zod"

export const createTenantSubscriptionSchema = z.object({
  TenantId: z.string().uuid("Invalid tenant ID"),
  PlanId: z.string().uuid("Invalid plan ID"),
  Status: z.string().min(1, "Status is required"),
  StartsAt: z.string().datetime("Invalid start date"),
  EndsAt: z.string().datetime("Invalid end date"),
  PriceAtPurchase: z.number().positive("Price must be a positive number"),
  AutoRenew: z.boolean(),
})

export const updateTenantSubscriptionSchema = createTenantSubscriptionSchema.partial()

export type CreateTenantSubscriptionInput = z.infer<typeof createTenantSubscriptionSchema>
export type UpdateTenantSubscriptionInput = z.infer<typeof updateTenantSubscriptionSchema>