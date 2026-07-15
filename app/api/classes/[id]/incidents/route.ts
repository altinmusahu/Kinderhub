import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { getTenant } from "@/lib/get-tenant"
import { IncidentsService } from "@/app/api/modules/incidents/incidents.service"
import { createIncidentSchema } from "@/app/api/modules/incidents/incidents.validation"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "incidents", "view", { class_id: id })
    if (!allowed) return NextResponse.json({ error: "You don't have permission to view incidents for this class" }, { status: 403 })

    const incidents = await IncidentsService.getByClassId(session.tenant_id, id)
    return NextResponse.json(incidents)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "incidents", "edit", { class_id: id })
    if (!allowed) return NextResponse.json({ error: "You don't have permission to report incidents for this class" }, { status: 403 })

    const body = await req.json()
    const parsed = createIncidentSchema.parse({
      ...body,
      tenant_id: session.tenant_id,
      reported_by: session.sub,
    })
    const incident = await IncidentsService.create(parsed)
    return NextResponse.json(incident, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
