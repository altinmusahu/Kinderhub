import { supabaseAdmin } from "@/lib/supabase-admin"
import { CreateDocumentsDto, Documents, UpdateDocumentsDto } from "./documents.types"

// Signed URLs expire in 7 days (604800 seconds)
const SIGNED_URL_TTL = 60 * 60 * 24 * 7
const STORAGE_BUCKET = "documents"

export const DocumentsRepository = {
  async findAll(tenantId: string): Promise<Documents[]> {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
    return data
  },

  async findTenantSubjects(tenantId: string): Promise<{
    familyName: Map<string, string>
    userName: Map<string, string>
    kidName: Map<string, string>
  }> {
    const [{ data: families, error: famError }, { data: users, error: userError }, { data: kids, error: kidError }] = await Promise.all([
      supabaseAdmin.from("families").select("id, name").eq("tenant_id", tenantId),
      supabaseAdmin.from("users").select("id, name, lastname").eq("tenant_id", tenantId),
      supabaseAdmin.from("kids").select("id, firstname, lastname").eq("tenant_id", tenantId),
    ])
    if (famError) throw new Error(famError.message)
    if (userError) throw new Error(userError.message)
    if (kidError) throw new Error(kidError.message)

    return {
      familyName: new Map((families ?? []).map((f) => [f.id, f.name])),
      userName: new Map((users ?? []).map((u) => [u.id, `${u.name} ${u.lastname}`])),
      kidName: new Map((kids ?? []).map((k) => [k.id, `${k.firstname} ${k.lastname}`])),
    }
  },

  async findAllRaw(): Promise<Documents[]> {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("id, file_url, kid_id, user_id, family_id, class_id, created_at")
      .order("created_at", { ascending: false })
    if (error) throw new Error(error.message)
    return data ?? []
  },

  async createSignedUrl(storagePath: string): Promise<string> {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_TTL)
    if (error) throw new Error(error.message)
    return data.signedUrl
  },

  async createSignedUrls(storagePaths: string[]): Promise<(string | null)[]> {
    if (storagePaths.length === 0) return []
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrls(storagePaths, SIGNED_URL_TTL)
    if (error) throw new Error(error.message)
    return (data ?? []).map((d) => d.signedUrl ?? null)
  },

  async uploadFile(storagePath: string, file: File): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: false })
    if (error) throw new Error(error.message)
  },

  async findById(id: string, tenantId: string): Promise<Documents | null> {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: CreateDocumentsDto): Promise<Documents> {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, tenantId: string, payload: UpdateDocumentsDto): Promise<Documents> {
    const { data, error } = await supabaseAdmin
      .from("documents")
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
      .from("documents")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}
