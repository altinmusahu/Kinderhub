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

  async setStripeCheckoutSessionId(id: string, sessionId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("tenant_subscriptions")
      .update({ stripe_checkout_session_id: sessionId })
      .eq("id", id)
    if (error) throw new Error(error.message)
  },

  async findByStripeCheckoutSessionId(sessionId: string): Promise<TenantSubscription | null> {
    const { data, error } = await supabaseAdmin
      .from("tenant_subscriptions")
      .select("*")
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async markActive(id: string, stripeSubscriptionId: string | null): Promise<TenantSubscription> {
    const { data, error } = await supabaseAdmin
      .from("tenant_subscriptions")
      .update({ status: "active", stripe_subscription_id: stripeSubscriptionId })
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },
}
