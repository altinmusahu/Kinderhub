import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { IncidentsService } from "@/app/api/modules/incidents/incidents.service"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ id: string; incidentId: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id, incidentId } = await params

    const allowed = await can(session, "incidents", "full", { class_id: id })
    if (!allowed) return NextResponse.json({ error: "You don't have permission to delete incidents for this class" }, { status: 403 })

    await IncidentsService.delete(incidentId, session.tenant_id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete incident" }, { status: 500 })
  }
}
