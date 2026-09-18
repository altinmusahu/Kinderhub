import { stripe } from "@/lib/stripe"
import type { SubscriptionPlan } from "./subscription_plans.types"
import { SubscriptionPlanRepository } from "./subscription_plans.repository"

export const SubscriptionPlanService = {
  async getAll(): Promise<SubscriptionPlan[]> {
    return SubscriptionPlanRepository.findAll()
  },

  async getById(plan_id: string): Promise<SubscriptionPlan> {
    const subscriptionPlans = await SubscriptionPlanRepository.findById(plan_id)
    // if (!subscriptionPlans) throw new Error("Subscription plan not found")
    return subscriptionPlans ?? { id: plan_id, code: "unknown", Name: "Unknown Plan", yearly_price: 0, is_active: false, stripe_product_id: null, stripe_price_id: null }
  },

  // Creates the plan's Stripe product/price the first time it's checked out, then reuses it.
  async getOrCreateStripePriceId(plan: SubscriptionPlan): Promise<string> {
    if (plan.stripe_price_id) return plan.stripe_price_id

    const product = await stripe.products.create({
      name: plan.Name,
      tax_code: "txcd_10103100",
      default_price_data: {
        unit_amount: Math.round(plan.yearly_price * 100),
        currency: "usd",
      },
    })

    const priceId = typeof product.default_price === "string"
      ? product.default_price
      : product.default_price?.id

    if (!priceId) throw new Error("Stripe did not return a default price for the new product")

    await SubscriptionPlanRepository.setStripeIds(plan.id, product.id, priceId)
    return priceId
  },
}
