import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase-admin"
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

  // Signup happens before any user session exists, so tenant creation must go through the
  // service-role client — there's no authenticated cookie for RLS to check against yet.
  async create(payload: CreateTenantDto): Promise<Tenant> {
    const { data, error } = await supabaseAdmin
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
      .eq("id", id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  // Used to roll back a just-created tenant if role seeding fails, in the same
  // pre-auth signup context as create() — no session for RLS to check against yet.
  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("tenants")
      .delete()
      .eq("id", id)
    if (error) throw new Error(error.message)
  },

  async setStripeCustomerId(id: string, stripeCustomerId: string): Promise<void> {
    const supabase = await client()
    const { error } = await supabase
      .from("tenants")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("id", id)
    if (error) throw new Error(error.message)
  },

  // Admin-scoped variant for contexts with no user session (e.g. Stripe webhooks).
  async setStripeCustomerIdAsAdmin(id: string, stripeCustomerId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("tenants")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("id", id)
    if (error) throw new Error(error.message)
  },

  async findByIdAsAdmin(id: string): Promise<Tenant | null> {
    const { data, error } = await supabaseAdmin
      .from("tenants")
      .select("*")
      .eq("id", id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },
}
