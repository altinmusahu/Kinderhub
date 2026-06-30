import type { TenantSubscription } from "./tenant_subscriptions.types"
import { TenantSubscriptionRepository } from "./tenant_subscriptions.repository"

export const TenantSubscriptionService = {
  async getByTenantId(tenantId: string): Promise<TenantSubscription | null> {
    return TenantSubscriptionRepository.findByTenantId(tenantId)
  },

  async create(payload: Omit<TenantSubscription, "id">): Promise<TenantSubscription> {
    return TenantSubscriptionRepository.create(payload)
  },
}
