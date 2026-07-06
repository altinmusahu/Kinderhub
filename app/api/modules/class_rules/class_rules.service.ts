import { ClassRulesRepository } from "./class_rules.repository"
import type { ClassRule, CreateClassRuleDto } from "./class_rules.types"

export const ClassRulesService = {
  async getByClassId(tenantId: string, classId: string): Promise<ClassRule[]> {
    return ClassRulesRepository.findByClassId(tenantId, classId)
  },

  async create(input: CreateClassRuleDto): Promise<ClassRule> {
    return ClassRulesRepository.create(input)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    return ClassRulesRepository.delete(id, tenantId)
  },
}
