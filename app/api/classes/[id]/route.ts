import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { ClassesService } from "@/app/api/modules/classes/classes.service"
import { updateClassSchema } from "@/app/api/modules/classes/classes.validation"
import { ZodError } from "zod"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await getTenant()
    const { id } = await params
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
    await getTenant()
    const { id } = await params
    await ClassesService.delete(id)
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
