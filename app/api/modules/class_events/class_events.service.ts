import { ClassEventsRepository } from "./class_events.repository"
import type { ClassEvent, CreateClassEventDto } from "./class_events.types"

export const ClassEventsService = {
  async getByClassId(tenantId: string, classId: string): Promise<ClassEvent[]> {
    return ClassEventsRepository.findByClassId(tenantId, classId)
  },

  async create(input: CreateClassEventDto): Promise<ClassEvent> {
    return ClassEventsRepository.create(input)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    return ClassEventsRepository.delete(id, tenantId)
  },
}
