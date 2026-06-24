import { NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/utils/supabase/admin"

const bodySchema = z.object({
  TenantId: z.uuid(),
  PlanId: z.uuid(),
  AutoRenew: z.boolean(),
})

export async function POST(req: Request) {
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
