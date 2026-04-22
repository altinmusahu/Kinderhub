import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type { CreateTenantDto, Tenant } from "./tenant.types"

async function client() {
  return createClient(await cookies())
}

export const TenantRepository = {
  async findAll(): Promise<Tenant[]> {
    const supabase = await client()
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: CreateTenantDto): Promise<Tenant> {
    const supabase = await client()
    const { data, error } = await supabase
      .from("tenants")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async findById(id: string): Promise<Tenant | null> {
    const supabase = await client()
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("Id", id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  }
}
