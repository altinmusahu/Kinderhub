import { supabaseAdmin } from "@/lib/supabase-admin"
import type { WorkTracking, CreateWorkTrackingDto, UpdateWorkTrackingDto } from "./work_tracking.types"

export const WorkTrackingRepository = {
  async findAll(tenantId: string): Promise<WorkTracking[]> {
    const { data, error } = await supabaseAdmin
      .from("work_tracking")
      .select("*")
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
    return data
  },

  async findById(id: string, tenantId: string): Promise<WorkTracking | null> {
    const { data, error } = await supabaseAdmin
      .from("work_tracking")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async findByUser(userId: string, tenantId: string): Promise<WorkTracking[]> {
    const { data, error } = await supabaseAdmin
      .from("work_tracking")
      .select("*")
      .eq("user_id", userId)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: CreateWorkTrackingDto): Promise<WorkTracking> {
    const { data, error } = await supabaseAdmin
      .from("work_tracking")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, tenantId: string, payload: UpdateWorkTrackingDto): Promise<WorkTracking> {
    const { data, error } = await supabaseAdmin
      .from("work_tracking")
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
      .from("work_tracking")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}
