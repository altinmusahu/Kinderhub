import { supabaseAdmin } from "@/lib/supabase-admin"
import { Currency } from "./currency.types"
import { CreateCurrencyInput, UpdateCurrencyInput } from "./currency.validation"

export const CurrencyRepository = {
  async findAll(tenantId: string): Promise<Currency[]> {
    const { data, error } = await supabaseAdmin
      .from("currency")
      .select("*")
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
    return data
  },

  async findById(id: string, tenantId: string): Promise<Currency | null> {
    const { data, error } = await supabaseAdmin
      .from("currency")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: CreateCurrencyInput): Promise<Currency> {
    const { data, error } = await supabaseAdmin
      .from("currency")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, tenantId: string, payload: UpdateCurrencyInput): Promise<Currency> {
    const { data, error } = await supabaseAdmin
      .from("currency")
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
      .from("currency")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}