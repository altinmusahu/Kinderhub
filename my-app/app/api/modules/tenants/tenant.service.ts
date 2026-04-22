import type { Tenant } from "./tenant.types"
import { TenantRepository } from "./tenant.repository"
import { CreateTenantInput } from "./tenant.validation"

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
    return TenantRepository.create({
      ...input,
      CreatedAt: new Date().toISOString().split("T")[0],
    })
  },
}