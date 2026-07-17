"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import type { UserById } from "@/app/api/modules/user/user.types"
import { PersonalCard }   from "./components/PersonalCard"
import { AccountCard }    from "./components/AccountCard"
import { EmploymentCard } from "./components/EmploymentCard"
import { ScheduleTab }    from "./components/ScheduleTab"
import { DocumentsTab }   from "./components/DocumentsTab"
import { SalaryTab }      from "./components/SalaryTab"
import { SalaryCard } from "./components/SalaryCard"
import { LeavesTab } from "./components/LeavesTab"

const TABS = ["Overview", "Salary", "Leaves", "Schedule", "Documents"] as const
type Tab = typeof TABS[number]

function OverviewTab({ user, userId }: { user: UserById; userId: string }) {
  return (
    <div style={{ padding: "20px 28px 40px", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <PersonalCard user={user} userId={userId} />
        <AccountCard  user={user} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <EmploymentCard user={user} userId={userId} />
        <SalaryCard salary={user.salary} />
      </div>
    </div>
  )
}

function isTab(value: string | null): value is Tab {
  return !!value && (TABS as readonly string[]).includes(value)
}

export default function EmployeeTabs({ user, userId, canEdit, viewerRole }: { user: UserById; userId: string; canEdit: boolean; viewerRole: string }) {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab")
  const [active, setActive] = useState<Tab>(isTab(initialTab) ? initialTab : "Overview")

  return (
    <>
      <div className="kh-tabs" style={{ margin: "0 28px" }}>
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

      {active === "Overview"  && <OverviewTab  user={user} userId={userId} />}
      {active === "Salary"    && <SalaryTab    userId={userId} />}
      {active === "Leaves"    && <LeavesTab    userId={userId} canReview={canEdit} viewerRole={viewerRole} />}
      {active === "Schedule"  && <ScheduleTab  userId={userId} />}
      {active === "Documents" && <DocumentsTab userId={userId} title="Employees files" canEdit={canEdit} />}
    </>
  )
}
