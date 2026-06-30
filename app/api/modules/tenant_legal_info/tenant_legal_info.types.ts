export type TenantLegalInfo = {
  id: string
  tenant_id: string
  legal_entity_name: string
  country: string
  tax_id: string
  registration_number: string
  street: string
  city: string
  postal_code: string
  rep_name: string
  rep_title: string
  rep_email: string
  rep_phone: string
  updated_by: string | null
  updated_at: string | null
  created_at: string
}

export type CreateTenantLegalInfoDto = Omit<TenantLegalInfo, "id" | "updated_by" | "updated_at" | "created_at">

export type UpdateTenantLegalInfoDto = Partial<Omit<CreateTenantLegalInfoDto, "tenant_id">>
