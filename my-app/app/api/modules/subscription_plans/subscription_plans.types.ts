export type SubscriptionPlan = {
  id: string
  code: string
  Name: string
  yearly_price: number
  isActive: boolean
}

export type CreateSubscriptionPlanDto = {
  code: string
  Name: string
  yearly_price: number
  isActive: boolean
}

export type UpdateSubscriptionPlanDto = Partial<CreateSubscriptionPlanDto>
