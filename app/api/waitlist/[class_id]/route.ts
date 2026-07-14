import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { WaitlistService } from "@/app/api/modules/waitlist/waitlist.service"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ class_id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { class_id } = await params
    const entries = await WaitlistService.getByClassId(tenant_id, class_id)
    return NextResponse.json(entries)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { class_id } = await params

    const allowed = await can(session, "classes", "edit", class_id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to manage this class's waitlist" }, { status: 403 })

    const body = await req.json()
    if (!body.kid_id) {
      return NextResponse.json({ error: "kid_id is required" }, { status: 400 })
    }
    const entry = await WaitlistService.create({ kid_id: body.kid_id, class_id, tenant_id: session.tenant_id })
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status })
  }
}
