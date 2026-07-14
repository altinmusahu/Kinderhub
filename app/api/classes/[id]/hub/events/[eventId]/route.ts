import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { ClassEventsService } from "@/app/api/modules/class_events/class_events.service"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ id: string; eventId: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id, eventId } = await params

    const allowed = await can(session, "hub", "full", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to delete this class's events" }, { status: 403 })

    await ClassEventsService.delete(eventId, session.tenant_id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
