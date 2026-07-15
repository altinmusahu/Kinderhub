import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { KidAttendanceService } from "@/app/api/modules/kid_attendance/kid_attendance.service"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { tenant_id } = session
    const { id } = await params

    const allowed = await can(session, "attendance", "view", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to view attendance for this class" }, { status: 403 })

    const sp = req.nextUrl.searchParams

    const filters = {
      dateFrom: sp.get("dateFrom") ?? undefined,
      dateTo: sp.get("dateTo") ?? undefined,
      search: sp.get("search") ?? undefined,
      checkedOutBy: sp.get("checkedOutBy") ?? undefined,
      releasedTo: sp.get("releasedTo") ?? undefined,
      status: sp.get("status") ?? undefined,
      page: Number(sp.get("page") ?? "1"),
      pageSize: Number(sp.get("pageSize") ?? "20"),
    }

    const [{ rows, total }, stats] = await Promise.all([
      KidAttendanceService.getFilteredForClass(tenant_id, id, filters),
      KidAttendanceService.getStatsForClass(tenant_id, id),
    ])

    return NextResponse.json({ rows, total, stats })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
