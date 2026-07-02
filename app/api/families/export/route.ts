import { NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { exportToExcelBuffer, type ExcelColumn } from "@/lib/excel-export"
import { FamilyWithDetails } from "../../modules/families/families.types"
import { FamiliesService } from "../../modules/families/families.service"

const FAMILIES_COLUMN: ExcelColumn<FamilyWithDetails>[] = [
  { header: "Name", width: 16, value: (s) => s.name },
  { header: "Status", width: 16, value: (s) => s.status },
  { header: "Plan", width: 28, value: (s) => s.plan },
  { header: "Balance", width: 18, value: (s) => s.balance },
  { header: "Primary Contact", width: 28, value: (s) => s.primary_contact ?? "—" },
  { header: "Kids Count", width: 16, value: (s) => s.kids_count },
  { header: "Created At", width: 28, value: (s) => new Date(s.created_at).toLocaleString() },
]

export async function GET() {
  try {
    const session = await getTenant()
    const families = await FamiliesService.getAllWithDetails(session.tenant_id)
    const buffer = await exportToExcelBuffer(families, FAMILIES_COLUMN, { sheetName: "Families", title: "Kinderhub — Families Directory" })

    logActivity(session, "exported", "Family", `${families.length} families`)

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="families-export-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to export families" }, { status })
  }
}
