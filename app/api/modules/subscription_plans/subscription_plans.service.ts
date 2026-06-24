import type { SubscriptionPlan } from "./subscription_plans.types"
import { SubscriptionPlanRepository } from "./subscription_plans.repository"

export const SubscriptionPlanService = {
  async getAll(): Promise<SubscriptionPlan[]> {
    return SubscriptionPlanRepository.findAll()
  },

  async getById(id: string): Promise<SubscriptionPlan> {
    const subscriptionPlans = await SubscriptionPlanRepository.findById(id)
    if (!subscriptionPlans) throw new Error("Subscription plan not found")
    return subscriptionPlans
  }
}
