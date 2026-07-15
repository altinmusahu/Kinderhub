export type TenantSubscription = {
  id: string
  tenant_id: string
  plan_id: string
  status: string
  starts_at: string
  ends_at: string
  price_at_purchase: number
  auto_renew: boolean
  created_at: string
  stripe_checkout_session_id: string | null
  stripe_subscription_id: string | null
}

export type TenantSubscriptionWithPlan = TenantSubscription & {
  subscription_plans: {
    id: string
    Name: string
    yearly_price: number
    is_active: boolean
  } | null
}
