import { WaitlistRepository } from "./waitlist.repository"
import type { CreateWaitlistDto, WaitlistEntry } from "./waitlist.types"

export const WaitlistService = {
  async getByClassId(tenantId: string, classId: string): Promise<WaitlistEntry[]> {
    return WaitlistRepository.findByClassId(tenantId, classId)
  },

  async create(input: CreateWaitlistDto): Promise<WaitlistEntry> {
    return WaitlistRepository.create(input)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    return WaitlistRepository.delete(id, tenantId)
  },
}
