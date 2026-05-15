import { WorkTrackingRepository } from "./work_tracking.repository"
import type { CreateWorkTrackingInput, UpdateWorkTrackingInput } from "./work_tracking.validation"
import type { WorkTracking } from "./work_tracking.types"

export const WorkTrackingService = {
  async getAll(tenantId: string): Promise<WorkTracking[]> {
    return WorkTrackingRepository.findAll(tenantId)
  },

  async getById(id: string, tenantId: string): Promise<WorkTracking> {
    const record = await WorkTrackingRepository.findById(id, tenantId)
    if (!record) throw new Error("Work tracking record not found")
    return record
  },

  async getByUser(userId: string, tenantId: string): Promise<WorkTracking[]> {
    return WorkTrackingRepository.findByUser(userId, tenantId)
  },

  async create(input: CreateWorkTrackingInput): Promise<WorkTracking> {
    return WorkTrackingRepository.create(input)
  },

  async update(id: string, tenantId: string, input: UpdateWorkTrackingInput): Promise<WorkTracking> {
    await WorkTrackingService.getById(id, tenantId)
    return WorkTrackingRepository.update(id, tenantId, input)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await WorkTrackingService.getById(id, tenantId)
    return WorkTrackingRepository.delete(id, tenantId)
  },
}
