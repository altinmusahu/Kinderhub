import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { ClassRulesService } from "@/app/api/modules/class_rules/class_rules.service"

type Params = { params: Promise<{ id: string; ruleId: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { ruleId } = await params
    await ClassRulesService.delete(ruleId, tenant_id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
