import React from "react"
import { cookies } from "next/headers"
import { DataTable, Column } from "@/app/components/dashboard/DataTable"
import { UserService } from "@/app/api/modules/user/user.service"
import { DepartmentService } from "@/app/api/modules/departments/department.service"
import { WorkTrackingService } from "@/app/api/modules/work_tracking/work_tracking.service"
import { verifyToken, cookieName } from "@/lib/auth"

const AVATAR_COLORS = ["#E8866A","#6BA07C","#C9AE4E","#D97F8C","#6A9EC8","#A07CB4","#7CA0B4","#B4A07C","#7CB49A","#C4B49A"]
function avatarColor(id: string) {
  let n = 0; for (const c of id) n += c.charCodeAt(0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}
function initials(name: string, lastname: string) {
  return `${name[0] ?? ""}${lastname[0] ?? ""}`.toUpperCase()
}

type StaffRow = {
  id: string
  initials: string
  color: string
  name: string
  role: string
  dept: string
  status: string
}

const columns: Column<StaffRow>[] = [
  {
    key: "member",
    header: "Member",
    cell: (s) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="kh-avatar" style={{ background: s.color + "22", color: s.color }}>{s.initials}</span>
        <span style={{ fontWeight: 600, fontSize: 13, color: "var(--kh-ink-900)" }}>{s.name}</span>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    cellStyle: { fontSize: 13, color: "var(--kh-ink-600)" },
    cell: (s) => s.role,
  },
  {
    key: "dept",
    header: "Department",
    cellStyle: { fontSize: 13, color: "var(--kh-ink-500)" },
    cell: (s) => s.dept,
  },
  {
    key: "status",
    header: "Status",
    cell: (s) => (
      <span className="kh-status-badge" style={{
        background: s.status === "Active" ? "#E8F5EC" : "#F0EDE8",
        color:      s.status === "Active" ? "#3A8C50" : "#7A7368",
      }}>
        <span className="kh-pill-dot" style={{ background: s.status === "Active" ? "#3A8C50" : "#9E968A" }} />
        {s.status}
      </span>
    ),
  },
]

export default async function StaffPage() {
  const store = await cookies()
  const token = store.get(cookieName())?.value!
  const session = await verifyToken(token)
  const { tenant_id } = session!

  const [users, departments, workTracking] = await Promise.all([
    UserService.getAll(tenant_id),
    DepartmentService.getAll(tenant_id),
    WorkTrackingService.getAll(tenant_id),
  ])

  const deptMap = new Map(departments.map((d) => [d.id, d.name]))

  const staff: StaffRow[] = users.map((u) => {
    const wt = workTracking.find((w) => w.user_id === u.id && !w.end_date)
    const dept = wt?.department_id ? (deptMap.get(wt.department_id) ?? "—") : "—"
    const color = avatarColor(u.id)
    return {
      id: u.id,
      initials: initials(u.name, u.lastname),
      color,
      name: `${u.name} ${u.lastname}`,
      role: u.role,
      dept,
      status: u.is_active ? "Active" : "Inactive",
    }
  })

  // Dept summary cards — group by name
  const deptCounts = departments.map((d) => ({
    name: d.name,
    color: avatarColor(d.id),
    count: workTracking.filter((w) => w.department_id === d.id && !w.end_date).length,
  }))

  const activeCount = staff.filter((s) => s.status === "Active").length

  return (
    <div className="kh-page">
      <header className="kh-topbar">
        <nav className="kh-breadcrumb">
          <span className="kh-breadcrumb-parent">Kinderhub</span>
          <span className="kh-breadcrumb-sep">/</span>
          <span className="kh-breadcrumb-current">Staff</span>
        </nav>
        <div className="kh-topbar-right">
          <button className="kh-btn">≡ Filter</button>
          <button className="kh-btn kh-btn--primary">+ Add staff</button>
        </div>
      </header>

      <div className="kh-content">
        <div style={{ marginBottom: 6 }}>
          <h1 className="kh-h1">Staff</h1>
          <p className="kh-sub">{staff.length} members · {departments.length} departments · {activeCount} active</p>
        </div>

        {deptCounts.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 4 }}>
            {deptCounts.map((d) => (
              <div key={d.name} className="kh-card" style={{ padding: "14px 16px", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>{d.name}</div>
                  <span style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11, color: "var(--kh-ink-400)" }}>{d.count}</span>
                </div>
                <div style={{ marginTop: 10, display: "flex" }}>
                  {Array.from({ length: Math.min(d.count, 5) }).map((_, i) => (
                    <span key={i} className="kh-avatar" style={{ background: d.color + "22", color: d.color, fontSize: 9, width: 22, height: 22, marginLeft: i > 0 ? -6 : 0, border: "2px solid #fff" }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {staff.length === 0 ? (
          <div className="kh-card" style={{ padding: "40px 24px", textAlign: "center", color: "var(--kh-ink-400)", fontSize: 13 }}>
            No staff members yet. Add users to see them here.
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={staff}
            getRowKey={(s) => s.id}
            title="All staff"
            meta={`${staff.length} members`}
          />
        )}
      </div>
    </div>
  )
}
