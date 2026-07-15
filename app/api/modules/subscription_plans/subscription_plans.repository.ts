import { supabaseAdmin } from "@/lib/supabase-admin"
import type { SubscriptionPlan } from "./subscription_plans.types"

export const SubscriptionPlanRepository = {
  async findAll(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabaseAdmin
      .from("subscription_plans")
      .select("id, code, Name, yearly_price, is_active, stripe_product_id, stripe_price_id")
      .eq("is_active", true)
      .order("yearly_price", { ascending: true })
    if (error) throw new Error(error.message)
    return data
  },

  async findById(id: string): Promise<SubscriptionPlan | null> {
    const { data, error } = await supabaseAdmin
      .from("subscription_plans")
      .select("id, code, Name, yearly_price, is_active, stripe_product_id, stripe_price_id")
      .eq("id", id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async setStripeIds(id: string, stripeProductId: string, stripePriceId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("subscription_plans")
      .update({ stripe_product_id: stripeProductId, stripe_price_id: stripePriceId })
      .eq("id", id)
    if (error) throw new Error(error.message)
  },
}
