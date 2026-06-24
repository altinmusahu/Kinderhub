import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { WorkTrackingService } from "../../modules/work_tracking/work_tracking.service"
import { updateWorkTrackingSchema } from "../../modules/work_tracking/work_tracking.validation"
import { getTenant } from "@/lib/get-tenant"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const record = await WorkTrackingService.getById(id, tenant_id)
    return NextResponse.json(record)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 404
    return NextResponse.json({ error: error instanceof Error ? error.message : "Not found" }, { status })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const body = updateWorkTrackingSchema.parse(await req.json())
    const record = await WorkTrackingService.update(id, tenant_id, body)
    return NextResponse.json(record)
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    const status = err instanceof Error && err.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to update record" }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    await WorkTrackingService.delete(id, tenant_id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to delete record" }, { status })
  }
}
