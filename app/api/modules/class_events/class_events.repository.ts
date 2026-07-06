import { supabaseAdmin } from "@/lib/supabase-admin"
import type { ClassEvent, CreateClassEventDto } from "./class_events.types"

export const ClassEventsRepository = {
  async findByClassId(tenantId: string, classId: string): Promise<ClassEvent[]> {
    const { data, error } = await supabaseAdmin
      .from("class_events")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("class_id", classId)
      .order("starts_at", { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
  },

  async create(payload: CreateClassEventDto): Promise<ClassEvent> {
    const { data, error } = await supabaseAdmin
      .from("class_events")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("class_events")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}
