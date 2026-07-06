import { KidsRepository } from "./kids.repository"
import { CreateKidsDto, Kids, KidWithClassIdNull, UpdateKidsDto } from "./kids.types"

export const KidsService = {
  async getAll(tenantId: string): Promise<Kids[]> {
    return KidsRepository.findAll(tenantId)
  },

  async getKidsWithClassIdNull(tenantId: string) : Promise<KidWithClassIdNull[]> {
    return KidsRepository.findKidsByClassIdNullable(tenantId);
  },

  async getKidsByClassId(tenant_id: string, class_id: string) : Promise<Kids[]> {
    return KidsRepository.findKidsByClassId(tenant_id, class_id);
  },

  async getById(id: string, tenantId: string): Promise<Kids> {
    const dept = await KidsRepository.findById(id, tenantId)
    if (!dept) throw new Error("Department not found")
    return dept
  },

  async getFamilyParents(id: string, tenantId: string): Promise<{ id: string; firstname: string; lastname: string }[]> {
    return KidsRepository.findFamilyParentsByKidId(id, tenantId)
  },

  async create(input: CreateKidsDto): Promise<Kids> {
    return KidsRepository.create(input)
  },

  async update(id: string, tenantId: string, input: UpdateKidsDto): Promise<Kids> {
    await KidsService.getById(id, tenantId)
    return KidsRepository.update(id, tenantId, input)
  },

  async updateClass(id: string, tenantId: string, class_id: string) : Promise<void> {
    await KidsRepository.updateClassId(id, tenantId, class_id);
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await KidsService.getById(id, tenantId)
    return KidsRepository.delete(id, tenantId)
  },
}