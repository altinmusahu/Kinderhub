import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { getTenant } from "@/lib/get-tenant"
import { ClassEventsService } from "@/app/api/modules/class_events/class_events.service"
import { createClassEventSchema } from "@/app/api/modules/class_events/class_events.validation"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "hub", "view", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to view this class's hub" }, { status: 403 })

    const events = await ClassEventsService.getByClassId(session.tenant_id, id)
    return NextResponse.json(events)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "hub", "edit", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to edit this class's events" }, { status: 403 })

    const body = await req.json()
    const parsed = createClassEventSchema.parse({ ...body, class_id: id, tenant_id: session.tenant_id })
    const event = await ClassEventsService.create(parsed)
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
