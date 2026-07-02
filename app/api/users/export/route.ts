import { NextResponse } from "next/server"
import { UserService } from "@/app/api/modules/user/user.service"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { exportToExcelBuffer, type ExcelColumn } from "@/lib/excel-export"
import type { UserWithWorkTrackingAndDepartment } from "@/app/api/modules/user/user.types"

const STAFF_COLUMNS: ExcelColumn<UserWithWorkTrackingAndDepartment>[] = [
  { header: "First name", width: 16, value: (s) => s.name },
  { header: "Last name", width: 16, value: (s) => s.lastname },
  { header: "Email", width: 28, value: (s) => s.email },
  { header: "Phone number", width: 18, value: (s) => s.phone_number },
  { header: "Date of birth", width: 14, value: (s) => s.date_of_birth },
  { header: "Position", width: 20, value: (s) => s.position_name ?? "" },
  { header: "Department", width: 20, value: (s) => s.department_name ?? "" },
  { header: "Joined", width: 14, value: (s) => new Date(s.created_at).toLocaleDateString() },
  { header: "Status", width: 12, value: (s) => (s.is_active ? "Active" : "Inactive") },
]

export async function GET() {
  try {
    const session = await getTenant()
    const staff = await UserService.getUsersWithWorkTrackingAndDepartment(session.tenant_id)
    const buffer = await exportToExcelBuffer(staff, STAFF_COLUMNS, { sheetName: "Staff", title: "Kinderhub — Staff Directory" })

    logActivity(session, "exported", "Staff", `${staff.length} staff members`)

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="staff-export-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to export staff" }, { status })
  }
}
