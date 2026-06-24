import { NextRequest, NextResponse } from "next/server"
import { WorkTrackingService } from "../modules/work_tracking/work_tracking.service"
import { createWorkTrackingSchema } from "../modules/work_tracking/work_tracking.validation"
import { getTenant } from "@/lib/get-tenant"

export async function GET() {
  try {
    const { tenant_id } = await getTenant()
    const records = await WorkTrackingService.getAll(tenant_id)
    return NextResponse.json(records)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tenant_id } = await getTenant()
    const body = await req.json()
    const parsed = createWorkTrackingSchema.parse({ ...body, tenant_id })
    const record = await WorkTrackingService.create(parsed)
    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status })
  }
}
