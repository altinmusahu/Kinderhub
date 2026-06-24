import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type { SubscriptionPlan } from "./subscription_plans.types"

async function client() {
  return createClient(await cookies())
}

export const SubscriptionPlanRepository = {
  async findAll(): Promise<SubscriptionPlan[]> {
    const supabase = await client()
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      
    if (error) throw new Error(error.message)
    return data
  },

  async findById(id: string): Promise<SubscriptionPlan | null> {
    const supabase = await client()
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("Id", id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  }
}
