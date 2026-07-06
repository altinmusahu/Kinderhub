import { IncidentsRepository } from "./incidents.repository"
import { KidsRepository } from "../kids/kids.repository"
import type { CreateIncidentDto, IncidentWithDetails } from "./incidents.types"

export const IncidentsService = {
  async getByClassId(tenantId: string, classId: string): Promise<IncidentWithDetails[]> {
    const kids = await KidsRepository.findKidsByClassId(tenantId, classId)
    return IncidentsRepository.findByKidIds(tenantId, kids.map((k) => k.id))
  },

  async create(input: CreateIncidentDto): Promise<IncidentWithDetails> {
    return IncidentsRepository.create(input)
  },

  async delete(id: string, tenantId: string, reportedBy: string): Promise<void> {
    return IncidentsRepository.delete(id, tenantId, reportedBy)
  },
}
