import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { ClassMenusService } from "@/app/api/modules/class_menus/class_menus.service"
import { upsertClassMenuCellSchema } from "@/app/api/modules/class_menus/class_menus.validation"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ id: string }> }

function mondayOf(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z")
  const day = d.getUTCDay() // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day
  d.setUTCDate(d.getUTCDate() + diff)
  return d.toISOString().split("T")[0]
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "curriculum", "view", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to view this class's menus" }, { status: 403 })

    const weekParam = req.nextUrl.searchParams.get("week")
    const weekStart = mondayOf(weekParam ?? new Date().toISOString().split("T")[0])

    const cells = await ClassMenusService.getWeek(session.tenant_id, id, weekStart)
    return NextResponse.json({ weekStart, cells })
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "curriculum", "edit", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to edit this class's menus" }, { status: 403 })

    const body = upsertClassMenuCellSchema.parse(await req.json())

    const cell = await ClassMenusService.saveCell(
      session.tenant_id, id, session.sub, body.date, body.meal_type, body.description
    )
    logActivity(session, "updated", "Class menu")
    return NextResponse.json(cell)
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
