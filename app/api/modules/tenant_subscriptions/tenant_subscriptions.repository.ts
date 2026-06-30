import { supabaseAdmin } from "@/lib/supabase-admin"
import type { TenantSubscription } from "./tenant_subscriptions.types"

export const TenantSubscriptionRepository = {
  async findByTenantId(tenantId: string): Promise<TenantSubscription | null> {
    const { data, error } = await supabaseAdmin
      .from("tenant_subscriptions")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: Omit<TenantSubscription, "id">): Promise<TenantSubscription> {
    const { data, error } = await supabaseAdmin
      .from("tenant_subscriptions")
      .insert([{ id: crypto.randomUUID(), ...payload }])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },
}
