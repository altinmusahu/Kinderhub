import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { FamilyChecklistProgressService } from "@/app/api/modules/family_checklist_progress/family_checklist_progress.service"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "curriculum", "view", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to view this class's checklist" }, { status: 403 })

    const detail = await FamilyChecklistProgressService.getDetailedProgressForClass(session.tenant_id, id)
    return NextResponse.json(detail)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
