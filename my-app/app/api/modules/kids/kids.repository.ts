import { supabaseAdmin } from "@/lib/supabase-admin"
import { CreateKidsDto, Kids, UpdateKidsDto } from "./kids.types"

export const KidsRepository = {
  async findAll(tenantId: string): Promise<Kids[]> {
    const { data, error } = await supabaseAdmin
      .from("kids")
      .select("*")
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
    return data
  },

  async findById(id: string, tenantId: string): Promise<Kids | null> {
    const { data, error } = await supabaseAdmin
      .from("kids")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: CreateKidsDto): Promise<Kids> {
    const { data, error } = await supabaseAdmin
      .from("kids")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, tenantId: string, payload: UpdateKidsDto): Promise<Kids> {
    const { data, error } = await supabaseAdmin
      .from("kids")
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
      .from("kids")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}