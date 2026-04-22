import type { TenantSubscriptions } from "./tenant_subscriptions.types"
import { TenantSubscriptionRepository } from "./tenant_subscriptions.repository"
import { CreateTenantSubscriptionInput } from "./tenant_subscriptions.validation"

export const TenantService = {
  async getAll(): Promise<TenantSubscriptions[]> {
    return TenantSubscriptionRepository.findAll()
  },

  async getById(id: string): Promise<TenantSubscriptions> {
    const tenant = await TenantSubscriptionRepository.findById(id)
    if (!tenant) throw new Error("Tenant subscription not found")
    return tenant
  },

  async create(input: CreateTenantSubscriptionInput): Promise<TenantSubscriptions> {
    return TenantSubscriptionRepository.create({
      ...input,
      CreatedAt: new Date().toISOString().split("T")[0],
    })
  },
}