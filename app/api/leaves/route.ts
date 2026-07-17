import { NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { LeaveRequestsService } from "@/app/api/modules/leave_requests/leave_requests.service"
import { getMyPermissionLevel } from "@/lib/permissions/can"

export async function GET() {
  try {
    const session = await getTenant()

    // This lists every staff member's leave requests at once, so it needs a level
    // above "own_only" — can() requires an ownerCheckId for "own_only" resources,
    // which doesn't make sense here since there's no single owner to check against.
    const level = await getMyPermissionLevel(session, "staff")
    const allowed = level === "edit" || level === "full"
    if (!allowed) return NextResponse.json({ error: "You don't have permission to view all staff leave requests" }, { status: 403 })

    const [requests, summary] = await Promise.all([
      LeaveRequestsService.getAllForTenant(session.tenant_id),
      LeaveRequestsService.getSummaryForTenant(session.tenant_id),
    ])
    return NextResponse.json({ requests, summary })
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

