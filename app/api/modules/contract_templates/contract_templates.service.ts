import { ContractTemplatesRepository } from "./contract_templates.repository"
import type { ContractTemplate, UpdateContractTemplateDto } from "./contract_templates.types"
import type { CreateContractTemplateInput } from "./contract_templates.validation"

export const ContractTemplatesService = {
  async getAll(tenantId: string): Promise<ContractTemplate[]> {
    return ContractTemplatesRepository.findAll(tenantId)
  },

  async getAllActive(tenantId: string): Promise<ContractTemplate[]> {
    return ContractTemplatesRepository.findAllActive(tenantId)
  },

  async getById(id: string, tenantId: string): Promise<ContractTemplate> {
    const template = await ContractTemplatesRepository.findById(id, tenantId)
    if (!template) throw new Error("Contract template not found")
    return template
  },

  async getDefault(tenantId: string): Promise<ContractTemplate | null> {
    return ContractTemplatesRepository.findDefault(tenantId)
  },

  async create(tenantId: string, input: CreateContractTemplateInput): Promise<ContractTemplate> {
    return ContractTemplatesRepository.create({
      tenant_id:  tenantId,
      name:       input.name,
      type:       input.type,
      body:       input.body,
      is_default: input.is_default,
      is_active:  input.is_active,
    })
  },

  async update(id: string, tenantId: string, input: UpdateContractTemplateDto): Promise<ContractTemplate> {
    await ContractTemplatesService.getById(id, tenantId)
    return ContractTemplatesRepository.update(id, tenantId, input)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await ContractTemplatesService.getById(id, tenantId)
    return ContractTemplatesRepository.delete(id, tenantId)
  },
}
