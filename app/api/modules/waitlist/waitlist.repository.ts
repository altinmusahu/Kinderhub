import { supabaseAdmin } from "@/lib/supabase-admin"
import type { CreateWaitlistDto, WaitlistEntry } from "./waitlist.types"

export const WaitlistRepository = {
  async findByClassId(tenantId: string, classId: string): Promise<WaitlistEntry[]> {
    const { data, error } = await supabaseAdmin
      .from("waitlists")
      .select("*, kids ( firstname, lastname, date_of_birth )")
      .eq("tenant_id", tenantId)
      .eq("class_id", classId)
      .order("created_at", { ascending: true })
    if (error) throw new Error(error.message)
    return (data ?? []).map(row => ({
      id:             row.id,
      kid_id:         row.kid_id,
      class_id:       row.class_id,
      created_at:     row.created_at,
      tenant_id:      row.tenant_id,
      firstname:      row.kids?.firstname,
      lastname:       row.kids?.lastname,
      date_of_birth:  row.kids?.date_of_birth,
    }))
  },

  async create(payload: CreateWaitlistDto): Promise<WaitlistEntry> {
    const { data, error } = await supabaseAdmin
      .from("waitlists")
      .insert([payload])
      .select("*, kids ( firstname, lastname, date_of_birth )")
      .single()
    if (error) throw new Error(error.message)
    return {
      id:             data.id,
      kid_id:         data.kid_id,
      class_id:       data.class_id,
      created_at:     data.created_at,
      tenant_id:      data.tenant_id,
      firstname:      data.kids?.firstname,
      lastname:       data.kids?.lastname,
      date_of_birth:  data.kids?.date_of_birth,
    }
  },

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("waitlists")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}
