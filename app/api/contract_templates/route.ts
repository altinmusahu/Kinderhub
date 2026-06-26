import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { ContractTemplatesService } from "@/app/api/modules/contract_templates/contract_templates.service"
import { createContractTemplateSchema } from "@/app/api/modules/contract_templates/contract_templates.validation"
import { ZodError } from "zod"

export async function GET() {
  try {
    const { tenant_id } = await getTenant()
    const templates = await ContractTemplatesService.getAll(tenant_id)
    return NextResponse.json(templates)
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tenant_id } = await getTenant()
    const body = await req.json()
    const parsed = createContractTemplateSchema.parse(body)
    const template = await ContractTemplatesService.create(tenant_id, parsed)
    return NextResponse.json(template, { status: 201 })
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
