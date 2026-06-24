import { supabaseAdmin } from "@/lib/supabase-admin"
import { CreateParentsDto, Parents, UpdateParentsDto } from "./parents.types"
import { CreateParentInput } from "./parents.validation"

export const ParentsRepository = {
  async findAll(tenantId: string): Promise<Parents[]> {
    const { data, error } = await supabaseAdmin
      .from("parents")
      .select("*")
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
    return data
  },

  async findById(id: string, tenantId: string): Promise<Parents | null> {
    const { data, error } = await supabaseAdmin
      .from("parents")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: CreateParentsDto): Promise<Parents> {
    const { data, error } = await supabaseAdmin
      .from("parents")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, tenantId: string, payload: UpdateParentsDto): Promise<Parents> {
    const { data, error } = await supabaseAdmin
      .from("parents")
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
      .from("parents")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}