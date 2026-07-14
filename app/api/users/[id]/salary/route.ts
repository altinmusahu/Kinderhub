import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { UserService } from "@/app/api/modules/user/user.service"
import { SalaryTrackingService } from "@/app/api/modules/salary_tracking/salary_tracking.service"
import { createSalaryTrackingSchema } from "@/app/api/modules/salary_tracking/salary_tracking.validation"
import { can } from "@/lib/permissions/can"
import { ZodError } from "zod"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    await UserService.getById(id, tenant_id)

    const history = await SalaryTrackingService.getByUser(id)
    return NextResponse.json(history)
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401
      : e instanceof Error && e.message === "User not found" ? 404 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "staff", "full", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to manage this staff member's salary" }, { status: 403 })

    const user = await UserService.getById(id, session.tenant_id)

    const parsed = createSalaryTrackingSchema.parse(await req.json())
    const record = await SalaryTrackingService.create(id, parsed)

    logActivity(session, "updated", "Salary", `${user.user.name} ${user.user.lastname}`)
    return NextResponse.json(record, { status: 201 })
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = e instanceof Error && e.message === "Unauthorized" ? 401
      : e instanceof Error && e.message === "User not found" ? 404 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "staff", "full", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to manage this staff member's salary" }, { status: 403 })

    await UserService.getById(id, session.tenant_id)

    const { salaryId } = await req.json()
    if (!salaryId) return NextResponse.json({ error: "salaryId is required" }, { status: 400 })

    await SalaryTrackingService.delete(salaryId, id)
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401
      : e instanceof Error && e.message === "User not found" ? 404 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
