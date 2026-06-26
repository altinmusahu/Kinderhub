import { ContractsRepository } from "./contracts.repository"
import { ContractTemplatesRepository } from "../contract_templates/contract_templates.repository"
import type { Contract, ContractWithRelations } from "./contracts.types"
import type { CreateContractInput, UpdateContractInput } from "./contracts.validation"

// Supported template variables
const VARIABLES: Record<string, string> = {}

export function resolveTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

export function buildContractNumber(tenantId: string): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `KH-${y}${m}${d}-${rand}`
}

export const ContractsService = {
  async getAll(tenantId: string): Promise<ContractWithRelations[]> {
    return ContractsRepository.findAll(tenantId)
  },

  async getByFamilyId(tenantId: string, familyId: string): Promise<ContractWithRelations[]> {
    return ContractsRepository.findByFamilyId(tenantId, familyId)
  },

  async getById(id: string, tenantId: string): Promise<ContractWithRelations> {
    const contract = await ContractsRepository.findById(id, tenantId)
    if (!contract) throw new Error("Contract not found")
    return contract
  },

  async create(
    tenantId: string,
    input: CreateContractInput,
    vars: Record<string, string>,
  ): Promise<ContractWithRelations> {
    const template = await ContractTemplatesRepository.findById(input.template_id, tenantId)
    if (!template) throw new Error("Contract template not found")

    const resolvedBody = resolveTemplate(template.body, vars)
    const contractNumber = buildContractNumber(tenantId)

    // Store resolved body as plain text in the contracts bucket
    const storagePath = `${tenantId}/${contractNumber}.txt`
    const blob = new Blob([resolvedBody], { type: "text/plain" })
    await ContractsRepository.uploadPdf(storagePath, blob, "text/plain")

    const created = await ContractsRepository.create({
      tenant_id:       tenantId,
      family_id:       input.family_id,
      kid_id:          input.kid_id,
      template_id:     input.template_id,
      contract_number: contractNumber,
      generated_pdf:   storagePath,
      status:          "Pending Signature",
      valid_from:      input.valid_from,
      valid_until:     input.valid_until,
    })

    const full = await ContractsRepository.findById(created.id, tenantId)
    if (!full) throw new Error("Failed to fetch created contract")
    return full
  },

  async updateStatus(id: string, tenantId: string, input: UpdateContractInput): Promise<Contract> {
    await ContractsService.getById(id, tenantId)
    return ContractsRepository.update(id, tenantId, input)
  },

  async getSignedPdfUrl(id: string, tenantId: string): Promise<string> {
    const contract = await ContractsService.getById(id, tenantId)
    return ContractsRepository.getSignedPdfUrl(contract.generated_pdf)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    const contract = await ContractsService.getById(id, tenantId)
    await ContractsRepository.deletePdf(contract.generated_pdf)
    return ContractsRepository.delete(id, tenantId)
  },
}
