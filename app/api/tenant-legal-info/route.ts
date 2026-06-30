import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { TenantLegalInfoService } from "@/app/api/modules/tenant_legal_info/tenant_legal_info.service"
import { createTenantLegalInfoSchema } from "@/app/api/modules/tenant_legal_info/tenant_legal_info.validation"

export async function GET() {
  try {
    const { tenant_id } = await getTenant()
    const info = await TenantLegalInfoService.getByTenantId(tenant_id)
    return NextResponse.json(info ?? null)
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getTenant()
    const body = createTenantLegalInfoSchema.parse(await req.json())
    const info = await TenantLegalInfoService.upsert(session.tenant_id, session.sub, body)
    logActivity(session, "updated", "Legal info", info.legal_entity_name)
    return NextResponse.json(info)
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.issues }, { status: 400 })
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status })
  }
}
