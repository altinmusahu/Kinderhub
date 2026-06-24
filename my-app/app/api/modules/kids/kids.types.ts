export type Kids = {
  id: string
  firstname: string
  lastname: string
  date_of_birth: string
  personal_number: string | null
  gender: string
  created_at: string
  class_id: string | null
}

export type CreateKidsDto = {
  firstname: string
  family_id: string
  lastname: string
  date_of_birth: string
  personal_number: string | null
  gender: string
  class_id: string | null
  tenant_id: string
}

export type UpdateKidsDto = Partial<CreateKidsDto>