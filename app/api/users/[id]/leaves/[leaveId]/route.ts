import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { UserService } from "@/app/api/modules/user/user.service"
import { LeaveRequestsService } from "@/app/api/modules/leave_requests/leave_requests.service"
import { reviewLeaveRequestSchema } from "@/app/api/modules/leave_requests/leave_requests.validation"
import { can, getMyPermissionLevel } from "@/lib/permissions/can"
import { ZodError } from "zod"

type Params = { params: Promise<{ id: string; leaveId: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id, leaveId } = await params

    // Reviewing someone's leave requires edit/full — own_only can't approve their own,
    // and can() needs an ownerCheckId for "own_only" which doesn't apply to a reviewer check.
    const level = await getMyPermissionLevel(session, "staff")
    const allowed = level === "edit" || level === "full"
    if (!allowed) return NextResponse.json({ error: "You don't have permission to review leave requests" }, { status: 403 })

    const user = await UserService.getById(id, session.tenant_id)

    const parsed = reviewLeaveRequestSchema.parse(await req.json())
    const record = await LeaveRequestsService.review(leaveId, session.sub, parsed)

    logActivity(session, "updated", "Leave request", `${user.user.name} ${user.user.lastname}`)
    return NextResponse.json(record)
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: e.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = e instanceof Error && e.message === "Unauthorized" ? 401
      : e instanceof Error && (e.message === "User not found" || e.message === "Leave request not found") ? 404
      : e instanceof Error && e.message === "Only pending requests can be reviewed" ? 409 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id, leaveId } = await params

    const allowed = await can(session, "staff", "edit", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to cancel this leave request" }, { status: 403 })

    await LeaveRequestsService.cancel(leaveId, id)
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401
      : e instanceof Error && e.message === "Leave request not found" ? 404
      : e instanceof Error && (e.message === "Only pending requests can be cancelled" || e.message === "You can only cancel your own leave requests") ? 409 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
