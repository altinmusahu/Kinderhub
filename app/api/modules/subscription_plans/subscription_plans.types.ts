export type SubscriptionPlan = {
  id: string
  code: string
  Name: string
  yearly_price: number
  is_active: boolean
  stripe_product_id: string | null
  stripe_price_id: string | null
}

export type CreateSubscriptionPlanDto = Omit<SubscriptionPlan, "id">
export type UpdateSubscriptionPlanDto = Partial<CreateSubscriptionPlanDto>
