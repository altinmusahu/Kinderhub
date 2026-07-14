import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { getTenant } from "@/lib/get-tenant"
import { ClassCurriculumItemsService } from "@/app/api/modules/class_curriculum_items/class_curriculum_items.service"
import { updateClassCurriculumItemSchema } from "@/app/api/modules/class_curriculum_items/class_curriculum_items.validation"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ id: string; curriculumId: string; itemId: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id, itemId } = await params

    const allowed = await can(session, "curriculum", "edit", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to edit this class's curriculum" }, { status: 403 })

    const body = await req.json()
    const parsed = updateClassCurriculumItemSchema.parse(body)
    const item = await ClassCurriculumItemsService.update(itemId, session.tenant_id, parsed)
    return NextResponse.json(item)
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id, itemId } = await params

    const allowed = await can(session, "curriculum", "full", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to delete this class's curriculum" }, { status: 403 })

    await ClassCurriculumItemsService.delete(itemId, session.tenant_id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
