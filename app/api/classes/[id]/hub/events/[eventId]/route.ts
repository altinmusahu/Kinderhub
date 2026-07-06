import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { ClassEventsService } from "@/app/api/modules/class_events/class_events.service"

type Params = { params: Promise<{ id: string; eventId: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { eventId } = await params
    await ClassEventsService.delete(eventId, tenant_id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
