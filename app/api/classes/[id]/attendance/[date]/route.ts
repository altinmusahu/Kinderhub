import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { getTenant } from "@/lib/get-tenant"
import { KidAttendanceService } from "@/app/api/modules/kid_attendance/kid_attendance.service"
import { upsertKidAttendanceSchema } from "@/app/api/modules/kid_attendance/kid_attendance.validation"

type Params = { params: Promise<{ id: string; date: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id, date } = await params
    const rows = await KidAttendanceService.getForClassAndDate(tenant_id, id, date)
    return NextResponse.json(rows)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id, date } = await params
    const body = await req.json()
    const parsed = upsertKidAttendanceSchema.parse(body)

    const record = await KidAttendanceService.upsertForKid({
      kid_id: parsed.kid_id,
      class_id: id,
      date,
      tenant_id: session.tenant_id,
      action: parsed.action,
      performed_by: session.sub,
      check_out_to: parsed.check_out_to,
      back_up_check_out_to: parsed.back_up_check_out_to,
      pickup_note: parsed.pickup_note,
      absent_reason: parsed.absent_reason,
    })
    return NextResponse.json(record)
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
