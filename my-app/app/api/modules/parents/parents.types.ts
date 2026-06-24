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
}

export type UpdateParentsDto = Partial<CreateParentsDto>
