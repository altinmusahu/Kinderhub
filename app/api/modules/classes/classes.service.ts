import { ClassesRepository } from "./classes.repository"
import type { ClassWithRelations } from "./classes.types"
import type { CreateClassInput, UpdateClassInput } from "./classes.validation"

export const ClassesService = {
  async getAll(): Promise<ClassWithRelations[]> {
    return ClassesRepository.findAll()
  },

  async getById(id: string): Promise<ClassWithRelations> {
    const cls = await ClassesRepository.findById(id)
    if (!cls) throw new Error("Class not found")
    return cls
  },

  async create(input: CreateClassInput): Promise<ClassWithRelations> {
    const created = await ClassesRepository.create({
      name:               input.name,
      average_year:       input.average_year,
      location_id:        input.location_id,
      starts_at:          input.starts_at,
      ends_at:            input.ends_at,
      capacity:           input.capacity,
      lead_user_id:       input.lead_user_id,
      assistant_user_id:  input.assistant_user_id ?? null,
      schedule:           input.schedule ?? null,
    })
    return ClassesRepository.findById(created.id) as Promise<ClassWithRelations>
  },

  async update(id: string, input: UpdateClassInput): Promise<ClassWithRelations> {
    await ClassesService.getById(id)
    await ClassesRepository.update(id, input)
    return ClassesRepository.findById(id) as Promise<ClassWithRelations>
  },

  async delete(id: string): Promise<void> {
    await ClassesService.getById(id)
    return ClassesRepository.delete(id)
  },
}
