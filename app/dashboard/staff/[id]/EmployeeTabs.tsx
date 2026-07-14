"use client"

import { useState } from "react"
import type { UserById } from "@/app/api/modules/user/user.types"
import { PersonalCard }   from "./components/PersonalCard"
import { AccountCard }    from "./components/AccountCard"
import { EmploymentCard } from "./components/EmploymentCard"
import { ScheduleTab }    from "./components/ScheduleTab"
import { DocumentsTab }   from "./components/DocumentsTab"
import { SalaryTab }      from "./components/SalaryTab"
import { SalaryCard } from "./components/SalaryCard"

const TABS = ["Overview", "Salary", "Schedule", "Documents"] as const
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

export default function EmployeeTabs({ user, userId, canEdit }: { user: UserById; userId: string; canEdit: boolean }) {
  const [active, setActive] = useState<Tab>("Overview")

  return (
    <>
      <div style={{ display: "flex", gap: 18, padding: "0 28px" }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setActive(t)}
            style={{
              padding: "10px 2px",
              fontSize: 13,
              background: "none",
              border: "none",
              borderBottom: active === t ? "2px solid var(--kh-peach)" : "2px solid transparent",
              color: active === t ? "var(--kh-ink-900)" : "var(--kh-ink-500)",
              fontWeight: active === t ? 600 : 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {active === "Overview"  && <OverviewTab  user={user} userId={userId} />}
      {active === "Salary"    && <SalaryTab    userId={userId} />}
      {active === "Schedule"  && <ScheduleTab  userId={userId} />}
      {active === "Documents" && <DocumentsTab userId={userId} title="Employees files" canEdit={canEdit} />}
    </>
  )
}
