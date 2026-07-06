import { ClassChecklistItemsRepository } from "./class_checklist_items.repository"
import type {
  ClassChecklistItem,
  CreateClassChecklistItemDto,
  UpdateClassChecklistItemDto,
} from "./class_checklist_items.types"

export const ClassChecklistItemsService = {
  async getByClassId(tenantId: string, classId: string): Promise<ClassChecklistItem[]> {
    return ClassChecklistItemsRepository.findByClassId(tenantId, classId)
  },

  async create(input: CreateClassChecklistItemDto): Promise<ClassChecklistItem> {
    return ClassChecklistItemsRepository.create(input)
  },

  async update(id: string, tenantId: string, input: UpdateClassChecklistItemDto): Promise<ClassChecklistItem> {
    return ClassChecklistItemsRepository.update(id, tenantId, input)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    return ClassChecklistItemsRepository.delete(id, tenantId)
  },
}
