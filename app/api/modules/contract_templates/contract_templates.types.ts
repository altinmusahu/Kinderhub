export type ContractTemplate = {
  id: string
  tenant_id: string
  name: string
  type: string
  body: string
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type CreateContractTemplateDto = {
  tenant_id: string
  name: string
  type: string
  body: string
  is_default: boolean
  is_active: boolean
}

export type UpdateContractTemplateDto = Partial<Omit<CreateContractTemplateDto, "tenant_id">>
