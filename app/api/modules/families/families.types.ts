export type Families = {
  id: string
  name: string
  status: string
  plan: string
  balance: number
  tenant_id: string
  created_at: string
}

export type FamilyWithDetails = {
  id: string
  name: string
  status: string
  plan: string
  balance: number
  created_at: string
  primary_contact: string | null   // firstname + lastname of first parent
  kids_count: number
}

export type CreateFamiliesDto = {
  name: string
  status: string
  plan: string
  balance: number
  tenant_id: string
}

export type UpdateFamiliesDto = Partial<CreateFamiliesDto>

export type FamilyParent = {
  id: string
  firstname: string
  lastname: string
  phone_number: string
  address: string
  pick_up: boolean
  is_active: boolean
  date_of_birth: string
  personal_number: string
  created_at: string
}

export type FamilyKid = {
  id: string
  firstname: string
  lastname: string
  date_of_birth: string
  gender: string
  personal_number: string | null
  class_id: string | null
}

export type FamilyDetail = {
  id: string
  name: string
  status: string
  plan: string
  balance: number
  created_at: string
  parents: FamilyParent[]
  kids: FamilyKid[]
}
