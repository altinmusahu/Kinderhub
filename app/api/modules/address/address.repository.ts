import { supabaseAdmin } from "@/lib/supabase-admin"
import { Address } from "./address.types"
import { CreateAddressInput, UpdateAddressInput } from "./address.validation"

export const AddressRepository = {
  async findById(user_id: string): Promise<Address | null> {
    const { data, error } = await supabaseAdmin
      .from("address")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: CreateAddressInput): Promise<Address> {
    const { data, error } = await supabaseAdmin
      .from("address")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, payload: UpdateAddressInput): Promise<Address> {
    const { data, error } = await supabaseAdmin
      .from("address")
      .update(payload)
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("address")
      .delete()
      .eq("id", id)
    if (error) throw new Error(error.message)
  },
}