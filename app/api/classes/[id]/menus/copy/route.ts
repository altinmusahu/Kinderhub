import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { ClassMenusService } from "@/app/api/modules/class_menus/class_menus.service"
import { copyClassMenuWeekSchema } from "@/app/api/modules/class_menus/class_menus.validation"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params
    const body = copyClassMenuWeekSchema.parse(await req.json())

    if (body.source_class_id === id) {
      return NextResponse.json({ error: "Source and target class can't be the same" }, { status: 400 })
    }

    const [canEditTarget, canReadSource] = await Promise.all([
      can(session, "curriculum", "edit", id),
      can(session, "curriculum", "edit", body.source_class_id),
    ])
    if (!canEditTarget || !canReadSource) {
      return NextResponse.json({ error: "You don't have permission to copy menus between these classes" }, { status: 403 })
    }

    const cells = await ClassMenusService.copyWeek(session.tenant_id, body.source_class_id, id, session.sub, body.week)
    logActivity(session, "updated", "Class menu")
    return NextResponse.json({ weekStart: body.week, cells })
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
