"use client"

import { useState } from "react"
import { StaffDirectoryTab } from "./StaffDirectoryTab"
import { StaffLeavesAdminTab } from "./StaffLeavesAdminTab"
import type { UserWithWorkTrackingAndDepartment } from "@/app/api/modules/user/user.types"
import type { LeaveRequestWithUser, TenantLeaveSummary } from "@/app/api/modules/leave_requests/leave_requests.types"

const TABS = ["Directory", "Leaves"] as const
type Tab = typeof TABS[number]

export function StaffPageTabs({ staff, showLeavesTab, initialLeaveRequests, initialLeaveSummary, viewerRole }: {
  staff: UserWithWorkTrackingAndDepartment[]
  showLeavesTab: boolean
  initialLeaveRequests: LeaveRequestWithUser[]
  initialLeaveSummary: TenantLeaveSummary
  viewerRole: string
}) {
  const [active, setActive] = useState<Tab>("Directory")

  return (
    <div>
      {showLeavesTab && (
        <div className="kh-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`kh-tab${active === t ? " kh-tab--active" : ""}`}
              onClick={() => setActive(t)}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {active === "Directory" && <StaffDirectoryTab staff={staff} />}
      {active === "Leaves" && showLeavesTab && (
        <StaffLeavesAdminTab staff={staff} initialRequests={initialLeaveRequests} initialSummary={initialLeaveSummary} viewerRole={viewerRole} />
      )}
    </div>
  )
}
