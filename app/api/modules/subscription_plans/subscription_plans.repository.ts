import { supabaseAdmin } from "@/lib/supabase-admin"
import type { SubscriptionPlan } from "./subscription_plans.types"

export const SubscriptionPlanRepository = {
  async findAll(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabaseAdmin
      .from("subscription_plans")
      .select("id, code, Name, yearly_price, is_active")
      .eq("is_active", true)
      .order("yearly_price", { ascending: true })
    if (error) throw new Error(error.message)
    return data
  },

  async findById(id: string): Promise<SubscriptionPlan | null> {
    const { data, error } = await supabaseAdmin
      .from("subscription_plans")
      .select("id, code, Name, yearly_price, is_active")
      .eq("id", id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },
}
