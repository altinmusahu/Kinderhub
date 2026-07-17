"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { DataTable, Column } from "@/app/components/dashboard/DataTable"
import { avatarColor, initials } from "@/components/ui/helper"
import { DepartmentFilterPills } from "./DepartmentFilterPills"
import type { UserWithWorkTrackingAndDepartment } from "@/app/api/modules/user/user.types"

function fmtSalary(salary: number | null, symbol: string | null) {
  if (salary === null) return "—"
  const amount = Number(salary).toLocaleString("en-US", { maximumFractionDigits: 0 })
  return symbol ? `${symbol}${amount}` : amount
}

export function StaffDirectoryTab({ staff }: { staff: UserWithWorkTrackingAndDepartment[] }) {
  const [activeDept, setActiveDept] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const departments = useMemo(() => {
    const counts = new Map<string, number>()
    for (const s of staff) {
      if (!s.department_name) continue
      counts.set(s.department_name, (counts.get(s.department_name) ?? 0) + 1)
    }
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }))
  }, [staff])

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      if (activeDept && s.department_name !== activeDept) return false
      if (search) {
        const q = search.toLowerCase()
        const name = `${s.name} ${s.lastname}`.toLowerCase()
        if (!name.includes(q) && !s.email?.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [staff, activeDept, search])

  const columns: Column<UserWithWorkTrackingAndDepartment>[] = [
    {
      key: "member",
      header: "Employee",
      cell: (s) => {
        const ac = avatarColor(s.id)
        const ini = initials(s.name, s.lastname)
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {s.profile_picture_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.profile_picture_url}
                alt=""
                className="kh-avatar"
                style={{ objectFit: "cover", overflow: "hidden", flexShrink: 0 }}
              />
            ) : (
              <span
                className="kh-avatar"
                style={{ background: ac + "22", color: ac, fontSize: 10, flexShrink: 0 }}
              >
                {ini}
              </span>
            )}
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--kh-ink-900)" }}>
                {s.name} {s.lastname}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)" }}>{s.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      key: "role_department",
      header: "Role · Department",
      cell: (s) => (
        <div>
          <div style={{ fontSize: 13, color: "var(--kh-ink-700)" }}>{s.position_name || "—"}</div>
          <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)" }}>{s.department_name || "—"}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (s) => (
        <span className="kh-status-badge" style={{
          background: s.is_active === true ? "#E8F5EC" : "#F0EDE8",
          color: s.is_active === true ? "#3A8C50" : "#7A7368",
        }}>
          <span className="kh-pill-dot" style={{ background: s.is_active === true ? "#3A8C50" : "#9E968A" }} />
          {s.is_active === true ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Joined",
      cellStyle: { fontSize: 12, color: "var(--kh-ink-400)" },
      cell: (s) => new Date(s.created_at).toLocaleDateString(),
    },
    {
      key: "pay",
      header: "Pay",
      cellStyle: { fontSize: 13, color: "var(--kh-ink-700)", fontFamily: "var(--kh-font-mono)" },
      cell: (s) => fmtSalary(s.salary, s.salary_symbol),
    },
    {
      key: "actions",
      header: "",
      cell: (s) => (
        <Link
          href={`/dashboard/staff/${s.id}`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 12, color: "var(--kh-peach)", textDecoration: "none", fontWeight: 500,
          }}
        >
          Open →
        </Link>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="kh-h1" style={{ margin: 0 }}>Staff</h1>
          <p style={{ fontSize: 13, color: "var(--kh-ink-400)", margin: "4px 0 0" }}>
            {staff.length} employees · {staff.filter(s => s.is_active).length} active · {departments.length} departments
          </p>
        </div>
        <input
          placeholder="Search staff…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 12px", border: "1px solid var(--kh-border)", borderRadius: 8,
            background: "var(--kh-ink-50)", fontSize: 13, color: "var(--kh-ink-800)",
            fontFamily: "inherit", outline: "none", minWidth: 220,
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <DepartmentFilterPills departments={departments} active={activeDept} onChange={setActiveDept} />
      </div>

      {filtered.length === 0 ? (
        <div className="kh-card" style={{ padding: "40px 24px", textAlign: "center", color: "var(--kh-ink-400)", fontSize: 13 }}>
          No staff members match these filters.
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(s) => s.id}
          title="All staff"
          meta={`${filtered.length} of ${staff.length} members`}
        />
      )}
    </div>
  )
}
