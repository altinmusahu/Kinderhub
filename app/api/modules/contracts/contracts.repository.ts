import { supabaseAdmin } from "@/lib/supabase-admin"
import type { Contract, ContractWithRelations, CreateContractDto, UpdateContractDto } from "./contracts.types"

const SIGNED_URL_TTL = 60 * 60 * 24 * 7 // 7 days

export const ContractsRepository = {
  async findAll(tenantId: string): Promise<ContractWithRelations[]> {
    const { data, error } = await supabaseAdmin
      .from("contracts")
      .select(`
        *,
        families ( name ),
        kids ( firstname, lastname ),
        contract_templates ( name )
      `)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(row => ({
      ...row,
      family_name:    row.families?.name ?? null,
      kid_firstname:  row.kids?.firstname ?? null,
      kid_lastname:   row.kids?.lastname ?? null,
      template_name:  row.contract_templates?.name ?? null,
    }))
  },

  async findByFamilyId(tenantId: string, familyId: string): Promise<ContractWithRelations[]> {
    const { data, error } = await supabaseAdmin
      .from("contracts")
      .select(`
        *,
        families ( name ),
        kids ( firstname, lastname ),
        contract_templates ( name )
      `)
      .eq("tenant_id", tenantId)
      .eq("family_id", familyId)
      .order("created_at", { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(row => ({
      ...row,
      family_name:    row.families?.name ?? null,
      kid_firstname:  row.kids?.firstname ?? null,
      kid_lastname:   row.kids?.lastname ?? null,
      template_name:  row.contract_templates?.name ?? null,
    }))
  },

  async findById(id: string, tenantId: string): Promise<ContractWithRelations | null> {
    const { data, error } = await supabaseAdmin
      .from("contracts")
      .select(`
        *,
        families ( name ),
        kids ( firstname, lastname ),
        contract_templates ( name )
      `)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return null
    return {
      ...data,
      family_name:    data.families?.name ?? null,
      kid_firstname:  data.kids?.firstname ?? null,
      kid_lastname:   data.kids?.lastname ?? null,
      template_name:  data.contract_templates?.name ?? null,
    }
  },

  async create(payload: CreateContractDto): Promise<Contract> {
    const { data, error } = await supabaseAdmin
      .from("contracts")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, tenantId: string, payload: UpdateContractDto): Promise<Contract> {
    const { data, error } = await supabaseAdmin
      .from("contracts")
      .update(payload)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("contracts")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },

  async getSignedPdfUrl(storagePath: string): Promise<string> {
    const { data, error } = await supabaseAdmin.storage
      .from("contracts")
      .createSignedUrl(storagePath, SIGNED_URL_TTL)
    if (error) throw new Error(error.message)
    return data.signedUrl
  },

  async uploadPdf(storagePath: string, file: File | Blob, contentType = "application/pdf"): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from("contracts")
      .upload(storagePath, file, { contentType, upsert: true })
    if (error) throw new Error(error.message)
  },

  async deletePdf(storagePath: string): Promise<void> {
    await supabaseAdmin.storage.from("contracts").remove([storagePath])
  },
}
