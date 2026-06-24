export type Tenant = {
  Id: string
  Name: string
  Slug: string
  CreatedAt: string
}

export type CreateTenantDto = {
  Name: string
  Slug: string
  CreatedAt: string
}

export type UpdateTenantDto = Partial<CreateTenantDto>