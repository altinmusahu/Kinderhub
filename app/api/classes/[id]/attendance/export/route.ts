import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { exportToExcelBuffer, type ExcelColumn } from "@/lib/excel-export"
import { KidAttendanceService } from "@/app/api/modules/kid_attendance/kid_attendance.service"
import { ClassesService } from "@/app/api/modules/classes/classes.service"
import type { KidAttendanceWithDetails } from "@/app/api/modules/kid_attendance/kid_attendance.types"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ id: string }> }

function fmtTime(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

const ATTENDANCE_COLUMNS: ExcelColumn<KidAttendanceWithDetails>[] = [
  { header: "Child", width: 22, value: (r) => r.kid_name ?? "—" },
  { header: "Date", width: 14, value: (r) => r.date },
  { header: "Check-in", width: 12, value: (r) => fmtTime(r.check_in) },
  { header: "Checked in by", width: 20, value: (r) => r.checked_in_by_name ?? "—" },
  { header: "Check-out", width: 12, value: (r) => fmtTime(r.check_out) },
  { header: "Checked out by", width: 20, value: (r) => r.checked_out_by_name ?? "—" },
  { header: "Released to", width: 22, value: (r) => r.check_out_to_name ?? "—" },
  { header: "Backup pickup", width: 24, value: (r) => r.back_up_check_out_to ?? "—" },
  { header: "Pickup note", width: 28, value: (r) => r.pickup_note ?? "—" },
  { header: "Status", width: 14, value: (r) => r.status ?? "—" },
  { header: "Absent reason", width: 28, value: (r) => r.absent_reason ?? "—" },
]

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
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
      page: 1,
      pageSize: 10000,
    }

    const [{ rows }, cls] = await Promise.all([
      KidAttendanceService.getFilteredForClass(session.tenant_id, id, filters),
      ClassesService.getById(id),
    ])

    const buffer = await exportToExcelBuffer(rows, ATTENDANCE_COLUMNS, {
      sheetName: "Attendance",
      title: `Kinderhub — ${cls.name} Attendance`,
    })

    logActivity(session, "exported", "Class", `${cls.name} attendance (${rows.length} records)`)

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${cls.name.replace(/[^a-zA-Z0-9._-]/g, "_")}-attendance-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to export attendance" }, { status })
  }
}
