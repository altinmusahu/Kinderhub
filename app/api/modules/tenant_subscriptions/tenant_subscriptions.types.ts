export type TenantSubscriptions = {
  Id: string
  TenantId: string
  PlanId: string
  Status: string
  StartsAt: string
  EndsAt: string
  PriceAtPurchase: number
  AutoRenew: boolean
  CreatedAt: string
}

export type CreateTenantSubscriptionDto = {
  TenantId: string
  PlanId: string
  Status: string
  StartsAt: string
  EndsAt: string
  PriceAtPurchase: number
  AutoRenew: boolean
  CreatedAt: string
}

export type UpdateTenantSubscriptionDto = Partial<CreateTenantSubscriptionDto>