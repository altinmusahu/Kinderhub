import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/utils/supabase/admin"
import { getTenant } from "@/lib/get-tenant"

const bodySchema = z.object({
  TenantId: z.uuid(),
  PlanId: z.uuid(),
  AutoRenew: z.boolean(),
})

export async function GET() {
  try {
    const { tenant_id } = await getTenant()
    const { data, error } = await supabaseAdmin
      .from("tenant_subscriptions")
      .select(`
        id, status, starts_at, ends_at, price_at_purchase, auto_renew, created_at,
        subscription_plans ( id, Name, yearly_price, is_active )
      `)
      .eq("tenant_id", tenant_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return NextResponse.json(data ?? null)
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = bodySchema.parse(body)

    // Fetch the plan to get the authoritative price — never trust client-sent price
    const { data: plan, error: planError } = await supabaseAdmin
      .from("subscription_plans")
      .select("YearlyPrice, IsActive")
      .eq("Id", parsed.PlanId)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ message: "Plan not found" }, { status: 404 })
    }

    if (!plan.IsActive) {
      return NextResponse.json({ message: "This plan is no longer available" }, { status: 400 })
    }

    const today = new Date()
    const nextYear = new Date(today)
    nextYear.setFullYear(today.getFullYear() + 1)
    const fmt = (d: Date) => d.toISOString().split("T")[0]

    const { data, error } = await supabaseAdmin
      .from("tenant_subscriptions")
      .insert([{
        Id: crypto.randomUUID(),
        TenantId: parsed.TenantId,
        PlanId: parsed.PlanId,
        Status: "active",
        StartsAt: fmt(today),
        EndsAt: fmt(nextYear),
        PriceAtPurchase: plan.YearlyPrice,
        AutoRenew: parsed.AutoRenew,
        CreatedAt: fmt(today),
      }])
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Something went wrong" },
      { status: 400 }
    )
  }
}
