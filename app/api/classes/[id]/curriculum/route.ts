import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { getTenant } from "@/lib/get-tenant"
import { ClassCurriculumService } from "@/app/api/modules/class_curriculum/class_curriculum.service"
import { createClassCurriculumSchema } from "@/app/api/modules/class_curriculum/class_curriculum.validation"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const periods = await ClassCurriculumService.getByClassId(tenant_id, id)
    return NextResponse.json(periods)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "curriculum", "edit", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to edit this class's curriculum" }, { status: 403 })

    const body = await req.json()
    const parsed = createClassCurriculumSchema.parse({
      ...body,
      class_id: id,
      tenant_id: session.tenant_id,
      created_by: session.sub,
    })
    const period = await ClassCurriculumService.create(parsed)
    return NextResponse.json(period, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
