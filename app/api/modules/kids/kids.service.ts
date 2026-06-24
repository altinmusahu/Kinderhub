import { KidsRepository } from "./kids.repository"
import { CreateKidsDto, Kids, UpdateKidsDto } from "./kids.types"

export const KidsService = {
  async getAll(tenantId: string): Promise<Kids[]> {
    return KidsRepository.findAll(tenantId)
  },

  async getById(id: string, tenantId: string): Promise<Kids> {
    const dept = await KidsRepository.findById(id, tenantId)
    if (!dept) throw new Error("Department not found")
    return dept
  },

  async create(input: CreateKidsDto): Promise<Kids> {
    return KidsRepository.create(input)
  },

  async update(id: string, tenantId: string, input: UpdateKidsDto): Promise<Kids> {
    await KidsService.getById(id, tenantId)
    return KidsRepository.update(id, tenantId, input)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await KidsService.getById(id, tenantId)
    return KidsRepository.delete(id, tenantId)
  },
}