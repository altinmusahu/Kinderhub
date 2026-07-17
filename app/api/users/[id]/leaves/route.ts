import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { UserService } from "@/app/api/modules/user/user.service"
import { LeaveRequestsService } from "@/app/api/modules/leave_requests/leave_requests.service"
import { createLeaveRequestSchema, setLeaveBalanceSchema } from "@/app/api/modules/leave_requests/leave_requests.validation"
import { can, getMyPermissionLevel } from "@/lib/permissions/can"
import { ZodError } from "zod"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "staff", "view", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to view this staff member's leave requests" }, { status: 403 })

    await UserService.getById(id, session.tenant_id)

    const [history, summary] = await Promise.all([
      LeaveRequestsService.getByUser(id),
      LeaveRequestsService.getSummaryForUser(session.tenant_id, id),
    ])
    return NextResponse.json({ history, summary })
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

    const allowed = await can(session, "staff", "edit", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to request leave for this staff member" }, { status: 403 })

    const user = await UserService.getById(id, session.tenant_id)

    const parsed = createLeaveRequestSchema.parse(await req.json())
    const record = await LeaveRequestsService.create(session.tenant_id, id, parsed)

    logActivity(session, "added", "Leave request", `${user.user.name} ${user.user.lastname}`)
    return NextResponse.json(record, { status: 201 })
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = e instanceof Error && e.message === "Unauthorized" ? 401
      : e instanceof Error && e.message === "User not found" ? 404 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    // Setting an employee's entitlement is an admin action — requires edit/full,
    // not own_only (an employee shouldn't be able to grant themselves more days).
    const level = await getMyPermissionLevel(session, "staff")
    const allowed = level === "edit" || level === "full"
    if (!allowed) return NextResponse.json({ error: "You don't have permission to set this staff member's leave balance" }, { status: 403 })

    const user = await UserService.getById(id, session.tenant_id)

    const parsed = setLeaveBalanceSchema.parse(await req.json())
    const summary = await LeaveRequestsService.setBalance(session.tenant_id, id, parsed.entitled_days, parsed.carried_over)

    logActivity(session, "updated", "Leave request", `${user.user.name} ${user.user.lastname}`)
    return NextResponse.json(summary)
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = e instanceof Error && e.message === "Unauthorized" ? 401
      : e instanceof Error && e.message === "User not found" ? 404 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
