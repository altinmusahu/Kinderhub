import { NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { exportToExcelBuffer, type ExcelColumn } from "@/lib/excel-export"
import { FoodSuppliesService } from "@/app/api/modules/food_supplies/food_supplies.service"
import type { FoodSupplyWithDetails } from "@/app/api/modules/food_supplies/food_supplies.types"
import { can } from "@/lib/permissions/can"

const SUPPLY_COLUMNS: ExcelColumn<FoodSupplyWithDetails>[] = [
  { header: "Date", width: 14, value: (s) => s.purchase_date },
  { header: "Vendor", width: 24, value: (s) => s.vendor_name ?? "" },
  { header: "Location", width: 18, value: (s) => s.location_name ?? "" },
  { header: "Logged by", width: 20, value: (s) => s.created_by_name ?? "" },
  { header: "Items", width: 10, value: (s) => s.items_count },
  { header: "Total", width: 14, value: (s) => Number(s.total_cost) },
]

export async function GET() {
  try {
    const session = await getTenant()

    const allowed = await can(session, "food_supplies", "view")
    if (!allowed) return NextResponse.json({ error: "You don't have permission to view food supplies" }, { status: 403 })

    const supplies = await FoodSuppliesService.getAllForTenant(session.tenant_id)
    const buffer = await exportToExcelBuffer(supplies, SUPPLY_COLUMNS, { sheetName: "Food supplies", title: "Kinderhub — Food Supplies" })

    logActivity(session, "exported", "Food supply", `${supplies.length} receipts`)

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="food-supplies-export-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to export food supplies" }, { status })
  }
}
