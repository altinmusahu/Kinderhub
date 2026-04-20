export type SubscriptionPlan = {
  Id: string
  Code: string
  Name: string
  YearlyPrice: number
  IsActive: boolean
}

export type CreateSubscriptionPlanDto = {
  Code: string
  Name: string
  YearlyPrice: number
  IsActive: boolean
}

export type UpdateSubscriptionPlanDto = Partial<CreateSubscriptionPlanDto>
