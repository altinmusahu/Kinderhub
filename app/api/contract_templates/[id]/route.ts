import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { ContractTemplatesService } from "@/app/api/modules/contract_templates/contract_templates.service"
import { updateContractTemplateSchema } from "@/app/api/modules/contract_templates/contract_templates.validation"
import { ZodError } from "zod"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const template = await ContractTemplatesService.getById(id, tenant_id)
    return NextResponse.json(template)
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401
      : e instanceof Error && e.message === "Contract template not found" ? 404 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const body = await req.json()
    const parsed = updateContractTemplateSchema.parse(body)
    const template = await ContractTemplatesService.update(id, tenant_id, parsed)
    return NextResponse.json(template)
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = e instanceof Error && e.message === "Unauthorized" ? 401
      : e instanceof Error && e.message === "Contract template not found" ? 404 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    await ContractTemplatesService.delete(id, tenant_id)
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401
      : e instanceof Error && e.message === "Contract template not found" ? 404 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
