import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { ContractsService } from "@/app/api/modules/contracts/contracts.service"
import { createContractSchema } from "@/app/api/modules/contracts/contracts.validation"
import { can } from "@/lib/permissions/can"
import { ZodError } from "zod"

export async function GET(req: NextRequest) {
  try {
    const session = await getTenant()
    const { searchParams } = new URL(req.url)
    const familyId = searchParams.get("family_id")

    const contracts = familyId
      ? await ContractsService.getByFamilyId(session.tenant_id, familyId)
      : await ContractsService.getAll(session.tenant_id)

    return NextResponse.json(contracts)
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getTenant()

    const allowed = await can(session, "billing", "edit")
    if (!allowed) return NextResponse.json({ error: "You don't have permission to generate contracts" }, { status: 403 })

    const body = await req.json()
    const parsed = createContractSchema.parse(body)

    // vars map — caller passes any extra variables in the request body under "vars"
    const vars: Record<string, string> = body.vars ?? {}

    const contract = await ContractsService.create(session.tenant_id, parsed, vars)
    logActivity(session, "generated", "Contract", contract.contract_number)
    return NextResponse.json(contract, { status: 201 })
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
