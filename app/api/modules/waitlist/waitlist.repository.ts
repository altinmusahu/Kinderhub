import { supabaseAdmin } from "@/lib/supabase-admin"
import type { CreateWaitlistDto, WaitlistEntry } from "./waitlist.types"

export const WaitlistRepository = {
  async findByClassId(tenantId: string, classId: string): Promise<WaitlistEntry[]> {
    const { data, error } = await supabaseAdmin
      .from("waitlist")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("class_id", classId)
      .order("created_at", { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
  },

  async create(payload: CreateWaitlistDto): Promise<WaitlistEntry> {
    const { data, error } = await supabaseAdmin
      .from("waitlist")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("waitlist")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}
