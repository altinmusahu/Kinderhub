import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { FamilyChecklistProgressService } from "@/app/api/modules/family_checklist_progress/family_checklist_progress.service"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const detail = await FamilyChecklistProgressService.getDetailedProgressForClass(tenant_id, id)
    return NextResponse.json(detail)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
