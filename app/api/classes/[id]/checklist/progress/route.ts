import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { FamilyChecklistProgressService } from "@/app/api/modules/family_checklist_progress/family_checklist_progress.service"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const progress = await FamilyChecklistProgressService.getProgressForClass(tenant_id, id)
    return NextResponse.json(progress)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "curriculum", "edit", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to edit this class's checklist" }, { status: 403 })

    const body = await req.json()
    if (!body.kid_id || !body.checklist_item_id || typeof body.is_checked !== "boolean") {
      return NextResponse.json({ error: "kid_id, checklist_item_id and is_checked are required" }, { status: 400 })
    }
    const progress = await FamilyChecklistProgressService.upsert({
      kid_id: body.kid_id,
      checklist_item_id: body.checklist_item_id,
      is_checked: body.is_checked,
    })
    return NextResponse.json(progress)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
