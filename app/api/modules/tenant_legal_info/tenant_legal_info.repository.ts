import { supabaseAdmin } from "@/lib/supabase-admin"
import type { TenantLegalInfo, CreateTenantLegalInfoDto, UpdateTenantLegalInfoDto } from "./tenant_legal_info.types"

export const TenantLegalInfoRepository = {
  async findByTenantId(tenantId: string): Promise<TenantLegalInfo | null> {
    const { data, error } = await supabaseAdmin
      .from("tenant_legal_info")
      .select("*")
      .eq("tenant_id", tenantId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: CreateTenantLegalInfoDto): Promise<TenantLegalInfo> {
    const { data, error } = await supabaseAdmin
      .from("tenant_legal_info")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, tenantId: string, payload: UpdateTenantLegalInfoDto & { updated_by?: string; updated_at?: string }): Promise<TenantLegalInfo> {
    const { data, error } = await supabaseAdmin
      .from("tenant_legal_info")
      .update(payload)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },
}
