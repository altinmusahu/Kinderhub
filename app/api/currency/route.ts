import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { CurrencyService } from "../modules/currency/currency.service"
import { createCurrencySchema } from "../modules/currency/currency.validation"
import { can } from "@/lib/permissions/can"

export async function GET() {
  try {
    const { tenant_id } = await getTenant()
    const currency = await CurrencyService.getAll(tenant_id)
    return NextResponse.json(currency)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch currencies" }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getTenant()

    const allowed = await can(session, "settings", "full")
    if (!allowed) return NextResponse.json({ message: "You don't have permission to add currencies" }, { status: 403 })

    const body = await req.json()
    const parsed = createCurrencySchema.parse({ ...body, tenant_id: session.tenant_id })
    const currency = await CurrencyService.create(parsed)
    return NextResponse.json(currency, { status: 201 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 400
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Something went wrong" },
      { status }
    )
  }
}
