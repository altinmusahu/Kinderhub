import { supabaseAdmin } from "@/lib/supabase-admin"
import type { Location, CreateLocationDto, UpdateLocationDto } from "./location.types"

export const LocationRepository = {
  async findAll(tenantId: string): Promise<Location[]> {
    const { data, error } = await supabaseAdmin
      .from("locations")
      .select("*")
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
    return data
  },

  async findById(id: string, tenantId: string): Promise<Location | null> {
    const { data, error } = await supabaseAdmin
      .from("locations")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: CreateLocationDto): Promise<Location> {
    const { data, error } = await supabaseAdmin
      .from("locations")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, tenantId: string, payload: UpdateLocationDto): Promise<Location> {
    const { data, error } = await supabaseAdmin
      .from("locations")
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
      .from("locations")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}