import { FamiliesRepository } from "./families.repository"
import type { CreateFamiliesDto, Families, FamilyDetail, FamilyWithDetails, UpdateFamiliesDto } from "./families.types"

export const FamiliesService = {
  async getAll(tenantId: string): Promise<Families[]> {
    return FamiliesRepository.findAll(tenantId)
  },

  async getAllWithDetails(tenantId: string): Promise<FamilyWithDetails[]> {
    return FamiliesRepository.findAllWithDetails(tenantId)
  },

  async getById(id: string, tenantId: string): Promise<Families> {
    const family = await FamiliesRepository.findById(id, tenantId)
    if (!family) throw new Error("Family not found")
    return family
  },

  async getByIdWithDetails(id: string, tenantId: string): Promise<FamilyDetail> {
    const family = await FamiliesRepository.findByIdWithDetails(id, tenantId)
    if (!family) throw new Error("Family not found")
    return family
  },

  async create(input: CreateFamiliesDto): Promise<Families> {
    return FamiliesRepository.create(input)
  },

  async update(id: string, tenantId: string, input: UpdateFamiliesDto): Promise<Families> {
    await FamiliesService.getById(id, tenantId)
    return FamiliesRepository.update(id, tenantId, input)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await FamiliesService.getById(id, tenantId)
    return FamiliesRepository.delete(id, tenantId)
  },
}
