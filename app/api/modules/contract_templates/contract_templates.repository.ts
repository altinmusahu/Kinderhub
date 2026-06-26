import { supabaseAdmin } from "@/lib/supabase-admin"
import type { ContractTemplate, CreateContractTemplateDto, UpdateContractTemplateDto } from "./contract_templates.types"

export const ContractTemplatesRepository = {
  async findAll(tenantId: string): Promise<ContractTemplate[]> {
    const { data, error } = await supabaseAdmin
      .from("contract_templates")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
    if (error) throw new Error(error.message)
    return data ?? []
  },

  async findAllActive(tenantId: string): Promise<ContractTemplate[]> {
    const { data, error } = await supabaseAdmin
      .from("contract_templates")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .order("name", { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
  },

  async findById(id: string, tenantId: string): Promise<ContractTemplate | null> {
    const { data, error } = await supabaseAdmin
      .from("contract_templates")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async findDefault(tenantId: string): Promise<ContractTemplate | null> {
    const { data, error } = await supabaseAdmin
      .from("contract_templates")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_default", true)
      .eq("is_active", true)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: CreateContractTemplateDto): Promise<ContractTemplate> {
    const { data, error } = await supabaseAdmin
      .from("contract_templates")
      .insert([{ ...payload, updated_at: new Date().toISOString() }])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, tenantId: string, payload: UpdateContractTemplateDto): Promise<ContractTemplate> {
    const { data, error } = await supabaseAdmin
      .from("contract_templates")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("contract_templates")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}
