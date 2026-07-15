export type Tenant = {
  Id: string
  Name: string
  Slug: string
  CreatedAt: string
  stripe_customer_id: string | null
}

export type CreateTenantDto = {
  Name: string
  Slug: string
  CreatedAt: string
}

export type UpdateTenantDto = Partial<CreateTenantDto>