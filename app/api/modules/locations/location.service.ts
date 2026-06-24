import { LocationRepository } from "./location.repository"
import type { CreateLocationInput, UpdateLocationInput } from "./location.validation"
import type { Location } from "./location.types"

export const LocationService = {
  async getAll(tenantId: string): Promise<Location[]> {
    return LocationRepository.findAll(tenantId)
  },

  async getById(id: string, tenantId: string): Promise<Location> {
    const location = await LocationRepository.findById(id, tenantId)
    if (!location) throw new Error("Location not found")
    return location
  },

  async create(input: CreateLocationInput): Promise<Location> {
    return LocationRepository.create(input)
  },

  async update(id: string, tenantId: string, input: UpdateLocationInput): Promise<Location> {
    await LocationService.getById(id, tenantId)
    return LocationRepository.update(id, tenantId, input)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await LocationService.getById(id, tenantId)
    return LocationRepository.delete(id, tenantId)
  },
}