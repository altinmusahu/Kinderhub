import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { LocationService } from "../../modules/locations/location.service"
import { updateLocationSchema } from "../../modules/locations/location.validation"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const location = await LocationService.getById(id, tenant_id)
    return NextResponse.json(location)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 404
    return NextResponse.json({ error: error instanceof Error ? error.message : "Not found" }, { status })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params
    const body = updateLocationSchema.parse(await req.json())
    const location = await LocationService.update(id, session.tenant_id, body)
    logActivity(session, "updated", "Location", location.name)
    return NextResponse.json(location)
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    const status = err instanceof Error && err.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to update location" }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    await LocationService.delete(id, tenant_id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to delete location" }, { status })
  }
}
