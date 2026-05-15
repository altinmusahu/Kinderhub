import { NextRequest, NextResponse } from "next/server"
import { LocationService } from "../modules/locations/location.service"
import { createLocationSchema } from "../modules/locations/location.validation"
import { getTenant } from "@/lib/get-tenant"

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
    const { tenant_id } = await getTenant()
    const body = await req.json()
    const parsed = createLocationSchema.parse({ ...body, tenant_id })
    const location = await LocationService.create(parsed)
    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status })
  }
}
