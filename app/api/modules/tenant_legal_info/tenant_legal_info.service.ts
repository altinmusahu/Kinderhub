import { TenantLegalInfoRepository } from "./tenant_legal_info.repository"
import type { TenantLegalInfo } from "./tenant_legal_info.types"
import type { CreateTenantLegalInfoInput, UpdateTenantLegalInfoInput } from "./tenant_legal_info.validation"

export const TenantLegalInfoService = {
  async getByTenantId(tenantId: string): Promise<TenantLegalInfo | null> {
    return TenantLegalInfoRepository.findByTenantId(tenantId)
  },

  async upsert(tenantId: string, userId: string, input: CreateTenantLegalInfoInput | UpdateTenantLegalInfoInput): Promise<TenantLegalInfo> {
    const existing = await TenantLegalInfoRepository.findByTenantId(tenantId)
    const now = new Date().toISOString()
    if (existing) {
      return TenantLegalInfoRepository.update(existing.id, tenantId, {
        ...input,
        updated_by: userId,
        updated_at: now,
      })
    }
    return TenantLegalInfoRepository.create({
      tenant_id: tenantId,
      legal_entity_name:   (input as CreateTenantLegalInfoInput).legal_entity_name,
      country:             (input as CreateTenantLegalInfoInput).country,
      tax_id:              (input as CreateTenantLegalInfoInput).tax_id,
      registration_number: (input as CreateTenantLegalInfoInput).registration_number,
      street:              (input as CreateTenantLegalInfoInput).street,
      city:                (input as CreateTenantLegalInfoInput).city,
      postal_code:         (input as CreateTenantLegalInfoInput).postal_code,
      rep_name:            (input as CreateTenantLegalInfoInput).rep_name,
      rep_title:           (input as CreateTenantLegalInfoInput).rep_title,
      rep_email:           (input as CreateTenantLegalInfoInput).rep_email,
      rep_phone:           (input as CreateTenantLegalInfoInput).rep_phone,
    })
  },
}
