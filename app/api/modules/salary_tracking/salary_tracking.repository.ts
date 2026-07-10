import { supabaseAdmin } from "@/lib/supabase-admin"
import type { SalaryTracking, CreateSalaryTrackingDto } from "./salary_tracking.types"

export const SalaryTrackingRepository = {
  async findByUser(userId: string): Promise<SalaryTracking[]> {
    const { data, error } = await supabaseAdmin
      .from("salary_tracking")
      .select(`
        *,
        currency (
          symbol
        )
      `)
      .eq("user_id", userId)
      .order("date", { ascending: false })
    if (error) throw new Error(error.message)
    return (
      data?.map(item => ({
        ...item,
        symbol: item.currency?.symbol
      })) ?? []
    )
  },

  async findActiveByUser(userId: string): Promise<SalaryTracking | null> {
    const { data, error } = await supabaseAdmin
      .from("salary_tracking")
      .select(`
        *,
        currency (
          symbol
        )
      `)
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return null
    return {
      ...data,
      symbol: data.currency?.symbol,
    }
  },

  async closeActive(userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("salary_tracking")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("is_active", true)
    if (error) throw new Error(error.message)
  },

  async create(payload: CreateSalaryTrackingDto): Promise<SalaryTracking> {
    const { data, error } = await supabaseAdmin
      .from("salary_tracking")
      .insert([payload])
      .select(`
        *,
        currency (
          symbol
        )
      `)
      .single()
    if (error) throw new Error(error.message)
    return {
      ...data,
      symbol: data.currency?.symbol,
    }
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("salary_tracking")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
    if (error) throw new Error(error.message)
  },
}
