export type SubscriptionPlan = {
  id: string
  code: string
  Name: string
  yearly_price: number
  is_active: boolean
}

export type CreateSubscriptionPlanDto = Omit<SubscriptionPlan, "id">
export type UpdateSubscriptionPlanDto = Partial<CreateSubscriptionPlanDto>
