import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { getTenant } from "@/lib/get-tenant"
import { ClassCurriculumItemsService } from "@/app/api/modules/class_curriculum_items/class_curriculum_items.service"
import { createClassCurriculumItemSchema } from "@/app/api/modules/class_curriculum_items/class_curriculum_items.validation"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ id: string; curriculumId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id, curriculumId } = await params

    const allowed = await can(session, "curriculum", "view", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to view this class's curriculum" }, { status: 403 })

    const items = await ClassCurriculumItemsService.getByCurriculumId(session.tenant_id, curriculumId)
    return NextResponse.json(items)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id, curriculumId } = await params

    const allowed = await can(session, "curriculum", "edit", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to edit this class's curriculum" }, { status: 403 })

    const body = await req.json()
    const parsed = createClassCurriculumItemSchema.parse({ ...body, curriculum_id: curriculumId, tenant_id: session.tenant_id })
    const item = await ClassCurriculumItemsService.create(parsed)
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
