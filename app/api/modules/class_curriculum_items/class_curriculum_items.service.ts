import { ClassCurriculumItemsRepository } from "./class_curriculum_items.repository"
import type {
  ClassCurriculumItem,
  CreateClassCurriculumItemDto,
  UpdateClassCurriculumItemDto,
} from "./class_curriculum_items.types"

export const ClassCurriculumItemsService = {
  async getByCurriculumId(tenantId: string, curriculumId: string): Promise<ClassCurriculumItem[]> {
    return ClassCurriculumItemsRepository.findByCurriculumId(tenantId, curriculumId)
  },

  async create(input: CreateClassCurriculumItemDto): Promise<ClassCurriculumItem> {
    return ClassCurriculumItemsRepository.create(input)
  },

  async update(id: string, tenantId: string, input: UpdateClassCurriculumItemDto): Promise<ClassCurriculumItem> {
    return ClassCurriculumItemsRepository.update(id, tenantId, input)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    return ClassCurriculumItemsRepository.delete(id, tenantId)
  },
}
