import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { ContractsService } from "@/app/api/modules/contracts/contracts.service"
import { updateContractSchema } from "@/app/api/modules/contracts/contracts.validation"
import { ZodError } from "zod"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const contract = await ContractsService.getById(id, tenant_id)
    return NextResponse.json(contract)
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401
      : e instanceof Error && e.message === "Contract not found" ? 404 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params
    const body = await req.json()
    const parsed = updateContractSchema.parse(body)
    const contract = await ContractsService.updateStatus(id, session.tenant_id, parsed)
    if (parsed.status) logActivity(session, "updated", "Contract", `status → ${parsed.status}`)
    return NextResponse.json(contract)
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = e instanceof Error && e.message === "Unauthorized" ? 401
      : e instanceof Error && e.message === "Contract not found" ? 404 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params
    const contract = await ContractsService.getById(id, session.tenant_id)
    await ContractsService.delete(id, session.tenant_id)
    logActivity(session, "deleted", "Contract", contract.contract_number)
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401
      : e instanceof Error && e.message === "Contract not found" ? 404 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
