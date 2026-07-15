import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { FoodSuppliesService } from "@/app/api/modules/food_supplies/food_supplies.service"
import { createFoodSupplySchema } from "@/app/api/modules/food_supplies/food_supplies.validation"
import { can } from "@/lib/permissions/can"

export async function GET() {
  try {
    const session = await getTenant()

    const allowed = await can(session, "food_supplies", "view")
    if (!allowed) return NextResponse.json({ error: "You don't have permission to view food supplies" }, { status: 403 })

    const supplies = await FoodSuppliesService.getAllForTenant(session.tenant_id)
    return NextResponse.json(supplies)
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getTenant()

    const allowed = await can(session, "food_supplies", "edit")
    if (!allowed) return NextResponse.json({ error: "You don't have permission to log food supplies" }, { status: 403 })

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    const itemsRaw = formData.get("items")
    let items: unknown
    try {
      items = JSON.parse(typeof itemsRaw === "string" ? itemsRaw : "[]")
    } catch {
      return NextResponse.json({ error: "Invalid items payload" }, { status: 400 })
    }

    const parsed = createFoodSupplySchema.parse({
      location_id: formData.get("location_id"),
      vendor_name: formData.get("vendor_name") || null,
      purchase_date: formData.get("purchase_date"),
      total_cost: formData.get("total_cost"),
      items,
    })

    const supply = await FoodSuppliesService.upload({
      file,
      tenant_id: session.tenant_id,
      created_by: session.sub,
      location_id: parsed.location_id,
      vendor_name: parsed.vendor_name,
      purchase_date: parsed.purchase_date,
      total_cost: parsed.total_cost,
      items: parsed.items,
    })

    logActivity(session, "added", "Food supply", supply.vendor_name ?? undefined)
    return NextResponse.json(supply, { status: 201 })
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
