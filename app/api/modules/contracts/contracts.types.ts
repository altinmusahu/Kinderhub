export type Contract = {
  id: string
  tenant_id: string
  family_id: string
  kid_id: string
  template_id: string
  contract_number: string
  generated_pdf: string   // storage path in "contracts" bucket
  status: "Pending Signature" | "Signed" | "Cancelled"
  valid_from: string      // DATE
  valid_until: string     // DATE
  created_at: string
}

export type ContractWithRelations = Contract & {
  family_name: string | null
  kid_firstname: string | null
  kid_lastname: string | null
  template_name: string | null
}

export type CreateContractDto = {
  tenant_id: string
  family_id: string
  kid_id: string
  template_id: string
  contract_number: string
  generated_pdf: string
  status: string
  valid_from: string
  valid_until: string
}

export type UpdateContractDto = Partial<Pick<CreateContractDto, "status" | "generated_pdf">>
