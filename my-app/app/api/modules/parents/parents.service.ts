import { ParentsRepository } from "./parents.repository"
import { CreateParentsDto, Parents, UpdateParentsDto } from "./parents.types"

export const ParentsService = {
  async getAll(tenantId: string): Promise<Parents[]> {
    return ParentsRepository.findAll(tenantId)
  },

  async getById(id: string, tenantId: string): Promise<Parents> {
    const dept = await ParentsRepository.findById(id, tenantId)
    if (!dept) throw new Error("Department not found")
    return dept
  },

  async create(input: CreateParentsDto): Promise<Parents> {
    return ParentsRepository.create(input)
  },

  async update(id: string, tenantId: string, input: UpdateParentsDto): Promise<Parents> {
    await ParentsService.getById(id, tenantId)
    return ParentsRepository.update(id, tenantId, input)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await ParentsService.getById(id, tenantId)
    return ParentsRepository.delete(id, tenantId)
  },
}