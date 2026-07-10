import { SalaryTrackingRepository } from "./salary_tracking.repository"
import type { CreateSalaryTrackingInput } from "./salary_tracking.validation"
import type { SalaryTracking } from "./salary_tracking.types"

export const SalaryTrackingService = {
  async getByUser(userId: string): Promise<SalaryTracking[]> {
    return SalaryTrackingRepository.findByUser(userId)
  },

  async getActiveByUser(userId: string): Promise<SalaryTracking | null> {
    return SalaryTrackingRepository.findActiveByUser(userId)
  },

  async create(userId: string, input: CreateSalaryTrackingInput): Promise<SalaryTracking> {
    // A new salary record supersedes whichever one is currently active
    await SalaryTrackingRepository.closeActive(userId)
    return SalaryTrackingRepository.create({
      user_id: userId,
      date: input.date,
      salary: input.salary,
      is_active: true,
    })
  },

  async delete(id: string, userId: string): Promise<void> {
    return SalaryTrackingRepository.delete(id, userId)
  },
}
