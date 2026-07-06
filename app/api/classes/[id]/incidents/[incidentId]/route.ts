import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { IncidentsService } from "@/app/api/modules/incidents/incidents.service"

type Params = { params: Promise<{ id: string; incidentId: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { incidentId } = await params
    await IncidentsService.delete(incidentId, session.tenant_id, session.sub)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "You can only delete incidents you reported" }, { status: 403 })
  }
}
