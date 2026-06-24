import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type { CreateTenantSubscriptionDto, TenantSubscriptions } from "./tenant_subscriptions.types"

async function client() {
  return createClient(await cookies())
}

export const TenantSubscriptionRepository = {
  async findAll(): Promise<TenantSubscriptions[]> {
    const supabase = await client()
    const { data, error } = await supabase
      .from("tenant_subscriptions")
      .select("*")
      
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: CreateTenantSubscriptionDto): Promise<TenantSubscriptions> {
    const supabase = await client()
    const { data, error } = await supabase
      .from("tenant_subscriptions")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async findById(id: string): Promise<TenantSubscriptions | null> {
    const supabase = await client()
    const { data, error } = await supabase
      .from("tenant_subscriptions")
      .select("*")
      .eq("Id", id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  }
}
