import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { KidAttendanceService } from "@/app/api/modules/kid_attendance/kid_attendance.service"

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
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
