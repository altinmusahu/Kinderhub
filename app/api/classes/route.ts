import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { ClassesService } from "@/app/api/modules/classes/classes.service"
import { createClassSchema } from "@/app/api/modules/classes/classes.validation"
import { can } from "@/lib/permissions/can"
import { ZodError } from "zod"

export async function GET() {
  try {
    await getTenant()
    const classes = await ClassesService.getAll()
    return NextResponse.json(classes)
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getTenant()

    const allowed = await can(session, "classes", "full")
    if (!allowed) return NextResponse.json({ error: "You don't have permission to create classes" }, { status: 403 })

    const body = await req.json()
    const parsed = createClassSchema.parse({
      ...body,
      capacity: Number(body.capacity),
      assistant_user_id: body.assistant_user_id || null,
    })
    const cls = await ClassesService.create(parsed)
    logActivity(session, "added", "Class", cls.name)
    return NextResponse.json(cls, { status: 201 })
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
