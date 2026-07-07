import { ClassCurriculumRepository } from "./class_curriculum.repository"
import type { ClassCurriculumWithCreator, CreateClassCurriculumDto, UpdateClassCurriculumDto } from "./class_curriculum.types"

export const ClassCurriculumService = {
  async getByClassId(tenantId: string, classId: string): Promise<ClassCurriculumWithCreator[]> {
    return ClassCurriculumRepository.findByClassId(tenantId, classId)
  },

  async create(input: CreateClassCurriculumDto): Promise<ClassCurriculumWithCreator> {
    return ClassCurriculumRepository.create(input)
  },

  async update(id: string, tenantId: string, input: UpdateClassCurriculumDto): Promise<ClassCurriculumWithCreator> {
    return ClassCurriculumRepository.update(id, tenantId, input)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    return ClassCurriculumRepository.delete(id, tenantId)
  },
}
