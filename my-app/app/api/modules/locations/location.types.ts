export type Location = {
  id: string
  tenant_id: string
  name: string
  street: string
  house_number: string | null
  postal_code: string | null
  city: string
  country: string
}

export type CreateLocationDto = {
  tenant_id: string
  name: string
  street: string
  house_number: string | null
  postal_code: string | null
  city: string
  country: string
}

export type UpdateLocationDto = Partial<CreateLocationDto>