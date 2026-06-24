import { ActivitiesRepository } from "./activities.repository"
import { Activities, CreateActivitiesDto } from "./activities.types"

export const ActivitiesService = {
  async getAll(tenantId: string): Promise<Activities[]> {
    return ActivitiesRepository.findAll(tenantId)
  },

  async create(input: CreateActivitiesDto): Promise<Activities> {
    return ActivitiesRepository.create(input)
  }
}