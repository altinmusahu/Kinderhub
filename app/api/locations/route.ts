import { NextRequest, NextResponse } from "next/server"
import { LocationService } from "../modules/locations/location.service"
import { createLocationSchema } from "../modules/locations/location.validation"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { can } from "@/lib/permissions/can"

export async function GET() {
  try {
    const { tenant_id } = await getTenant()
    const locations = await LocationService.getAll(tenant_id)
    return NextResponse.json(locations)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getTenant()

    const allowed = await can(session, "settings", "full")
    if (!allowed) return NextResponse.json({ error: "You don't have permission to add locations" }, { status: 403 })

    const body = await req.json()
    const parsed = createLocationSchema.parse({ ...body, tenant_id: session.tenant_id })
    const location = await LocationService.create(parsed)
    logActivity(session, "added", "Location", location.name)
    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status })
  }
}
