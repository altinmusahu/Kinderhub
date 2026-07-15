export type Tenant = {
  id: string
  name: string
  slug: string
  created_at: string
  stripe_customer_id: string | null
}

export type CreateTenantDto = {
  name: string
  slug: string
}

export type UpdateTenantDto = Partial<CreateTenantDto>