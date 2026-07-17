import { cookies } from "next/headers"
import AddStaffModal from "@/components/ui/AddStaffModal"
import ExportStaffButton from "@/app/components/dashboard/ExportStaffButton"
import { UserService } from "@/app/api/modules/user/user.service"
import { LeaveRequestsService } from "@/app/api/modules/leave_requests/leave_requests.service"
import { verifyToken, cookieName } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserWithWorkTrackingAndDepartment } from "@/app/api/modules/user/user.types"
import MobileMenuButton from "@/app/components/dashboard/MobileMenuButton"
import { AccessDenied } from "@/app/components/dashboard/AccessDenied"
import { hasAnyAccess, getMyPermissionLevel } from "@/lib/permissions/can"
import { StaffPageTabs } from "./components/StaffPageTabs"

export default async function StaffPage() {
  const store = await cookies()
  const token = store.get(cookieName())?.value ?? null

  if (!token) {
    redirect("/login")
  }

  const session = await verifyToken(token)

  if(!session) {
    redirect("/login")
  }

  const { tenant_id } = session!

  const allowed = await hasAnyAccess(session!, "staff")
  if (!allowed) return <AccessDenied />

  const level = await getMyPermissionLevel(session!, "staff")
  const showLeavesTab = level === "edit" || level === "full"

  const [allUsers, leaveRequests, leaveSummary] = await Promise.all([
    UserService.getUsersWithWorkTrackingAndDepartment(tenant_id),
    showLeavesTab ? LeaveRequestsService.getAllForTenant(tenant_id) : Promise.resolve([]),
    showLeavesTab ? LeaveRequestsService.getSummaryForTenant(tenant_id) : Promise.resolve({ pending: 0, approvedThisMonth: 0, onLeaveToday: 0, requestedThisYear: 0 }),
  ])

  const users = level === "own_only" ? allUsers.filter((u) => u.id === session!.sub) : allUsers

  const staff: UserWithWorkTrackingAndDepartment[] = users.map((u) => {
    return {
      id: u.id,
      name: u.name,
      lastname: u.lastname,
      phone_number: u.phone_number,
      created_at: u.created_at,
      is_active: u.is_active,
      date_of_birth: u.date_of_birth,
      email: u.email,
      department_id: u.department_id,
      department_name: u.department_name,
      position_name: u.position_name,
      profile_picture_url: u.profile_picture_url,
      salary: u.salary,
      salary_symbol: u.salary_symbol,
    }
  })

  return (
    <div className="kh-page">
      <header className="kh-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MobileMenuButton />
          <nav className="kh-breadcrumb">
            <span className="kh-breadcrumb-parent">Kinderhub</span>
            <span className="kh-breadcrumb-sep">/</span>
            <span className="kh-breadcrumb-current">Staff</span>
          </nav>
        </div>
        <div className="kh-topbar-right">
          <button className="kh-btn">≡ Department</button>
          <ExportStaffButton />
          <AddStaffModal />
        </div>
      </header>

      <div className="kh-content">
        {staff.length === 0 ? (
          <div className="kh-card" style={{ padding: "40px 24px", textAlign: "center", color: "var(--kh-ink-400)", fontSize: 13 }}>
            No staff members yet. Add users to see them here.
          </div>
        ) : (
          <StaffPageTabs
            staff={staff}
            showLeavesTab={showLeavesTab}
            initialLeaveRequests={leaveRequests}
            initialLeaveSummary={leaveSummary}
            viewerRole={session!.role}
          />
        )}
      </div>
    </div>
  )
}