export type Parents = {
  id: string
  family_id: string
  firstname: string
  lastname: string
  date_of_birth: string
  personal_number: string
  is_active: boolean
  phone_number: string
  address: string
  pick_up: boolean
  tenant_id: string
  created_at: string
  email: string | null
  work_phone_number: string | null
  has_legal_custody: boolean | null
  custody_notes: string | null
  has_legal_custody_file_uploaded: boolean | null
}

export type CreateParentsDto = {
  family_id: string
  firstname: string
  lastname: string
  date_of_birth: string
  personal_number: string
  is_active: boolean
  phone_number: string
  address: string
  pick_up: boolean
  tenant_id: string
  email?: string | null
  work_phone_number?: string | null
  has_legal_custody?: boolean | null
  custody_notes?: string | null
  has_legal_custody_file_uploaded?: boolean | null
}

export type UpdateParentsDto = Partial<CreateParentsDto>
