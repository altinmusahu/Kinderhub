import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { getTenant } from "@/lib/get-tenant"
import { CurrencyService } from "../../modules/currency/currency.service"
import { updateCurrencySchema } from "../../modules/currency/currency.validation"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const currency = await CurrencyService.getById(id, tenant_id)
    return NextResponse.json(currency)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 404
    return NextResponse.json({ error: error instanceof Error ? error.message : "Not found" }, { status })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params
    const body = updateCurrencySchema.parse(await request.json())
    const currency = await CurrencyService.update(id, session.tenant_id, body)
    return NextResponse.json(currency)
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    const status = err instanceof Error && err.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to update department" }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    await CurrencyService.delete(id, tenant_id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to delete currency" }, { status })
  }
}
