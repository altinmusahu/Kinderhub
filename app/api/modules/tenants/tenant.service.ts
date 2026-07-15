import type { Tenant } from "./tenant.types"
import { TenantRepository } from "./tenant.repository"
import { CreateTenantInput } from "./tenant.validation"
import { RolesService } from "@/app/api/modules/roles/roles.service"

export const TenantService = {
  async getAll(): Promise<Tenant[]> {
    return TenantRepository.findAll()
  },

  async getById(id: string): Promise<Tenant> {
    const tenant = await TenantRepository.findById(id)
    if (!tenant) throw new Error("Tenant not found")
    return tenant
  },

  async create(input: CreateTenantInput): Promise<Tenant> {
    const tenant = await TenantRepository.create(input)

    try {
      await RolesService.seedDefaultRoles(tenant.id)
    } catch (error) {
      await TenantRepository.delete(tenant.id).catch(() => {})
      throw error
    }

    return tenant
  },

  async getByIdAsAdmin(id: string): Promise<Tenant> {
    const tenant = await TenantRepository.findByIdAsAdmin(id)
    if (!tenant) throw new Error("Tenant not found")
    return tenant
  },

  async setStripeCustomerIdAsAdmin(id: string, stripeCustomerId: string): Promise<void> {
    return TenantRepository.setStripeCustomerIdAsAdmin(id, stripeCustomerId)
  },
}