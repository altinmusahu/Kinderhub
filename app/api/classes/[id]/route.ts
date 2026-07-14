import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { ClassesService } from "@/app/api/modules/classes/classes.service"
import { updateClassSchema } from "@/app/api/modules/classes/classes.validation"
import { can } from "@/lib/permissions/can"
import { ZodError } from "zod"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "classes", "edit", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to edit this class" }, { status: 403 })

    const body = await req.json()
    const parsed = updateClassSchema.parse(body)
    const cls = await ClassesService.update(id, parsed)
    return NextResponse.json(cls)
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "classes", "full", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to delete this class" }, { status: 403 })

    await ClassesService.delete(id)
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
