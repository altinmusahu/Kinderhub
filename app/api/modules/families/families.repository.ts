import { supabaseAdmin } from "@/lib/supabase-admin"
import type { CreateFamiliesDto, Families, FamilyDetail, FamilyWithDetails, UpdateFamiliesDto } from "./families.types"

export const FamiliesRepository = {
  async findAll(tenantId: string): Promise<Families[]> {
    const { data, error } = await supabaseAdmin
      .from("families")
      .select("*")
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
    return data
  },

  async findAllWithDetails(tenantId: string): Promise<FamilyWithDetails[]> {
    const { data, error } = await supabaseAdmin
      .from("families")
      .select(`
        id, name, status, plan, balance, created_at,
        parents ( id, firstname, lastname, has_legal_custody, has_legal_custody_file_uploaded ),
        kids ( id )
      `)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
    if (error) throw new Error(error.message)

    return (data ?? []).map((f: any) => {
      const parents = Array.isArray(f.parents) ? f.parents : []
      const primary = parents[0] ?? null
      return {
        id:                 f.id,
        name:               f.name,
        status:             f.status,
        plan:               f.plan,
        balance:            Number(f.balance ?? 0),
        created_at:         f.created_at,
        primary_contact:    primary ? `${primary.firstname} ${primary.lastname}` : null,
        kids_count:         Array.isArray(f.kids) ? f.kids.length : 0,
        needs_custody_file: parents.some((p: { has_legal_custody: boolean | null; has_legal_custody_file_uploaded: boolean | null }) => p.has_legal_custody === true && p.has_legal_custody_file_uploaded !== true),
      }
    })
  },

  async findByIdWithDetails(id: string, tenantId: string): Promise<FamilyDetail | null> {
    const { data, error } = await supabaseAdmin
      .from("families")
      .select(`
        id, name, status, plan, balance, created_at,
        parents ( id, firstname, lastname, phone_number, address, pick_up, is_active, date_of_birth, personal_number, created_at, email, work_phone_number, has_legal_custody, custody_notes, has_legal_custody_file_uploaded ),
        kids    ( id, firstname, lastname, date_of_birth, gender, personal_number, class_id )
      `)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return null
    const parents = Array.isArray(data.parents)
      ? [...data.parents].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      : []
    return {
      id:                 data.id,
      name:               data.name,
      status:             data.status,
      plan:               data.plan,
      balance:            Number(data.balance ?? 0),
      created_at:         data.created_at,
      parents,
      kids:               Array.isArray(data.kids) ? data.kids : [],
      needs_custody_file: parents.some((p: { has_legal_custody: boolean | null; has_legal_custody_file_uploaded: boolean | null }) => p.has_legal_custody === true && p.has_legal_custody_file_uploaded !== true),
    }
  },

  async findById(id: string, tenantId: string): Promise<Families | null> {
    const { data, error } = await supabaseAdmin
      .from("families")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: CreateFamiliesDto): Promise<Families> {
    const { data, error } = await supabaseAdmin
      .from("families")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, tenantId: string, payload: UpdateFamiliesDto): Promise<Families> {
    const { data, error } = await supabaseAdmin
      .from("families")
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
      .from("families")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}
