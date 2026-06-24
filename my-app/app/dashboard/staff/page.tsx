import { cookies } from "next/headers"
import Link from "next/link"
import { DataTable, Column } from "@/app/components/dashboard/DataTable"
import AddStaffModal from "@/components/ui/AddStaffModal"
import { UserService } from "@/app/api/modules/user/user.service"
import { verifyToken, cookieName } from "@/lib/auth"
import { redirect } from "next/navigation"
import { avatarColor, initials } from "@/components/ui/helper"
import { StaffRow } from "@/app/api/modules/user/user.types"

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

  const [users] = await Promise.all([
    UserService.getUsersWithWorkTrackingAndDepartment(tenant_id),
    // DepartmentService.getAll(tenant_id),
    // WorkTrackingService.getAll(tenant_id),
  ])

  const columns: Column<StaffRow>[] = [
    {
      key: "member",
      header: "Employee",
      cell: (s) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="kh-avatar" style={{ background: s.color + "22", color: s.color }}>{s.initials}</span>
          <span style={{ fontWeight: 600, fontSize: 13, color: "var(--kh-ink-900)" }}>{s.name}</span>
        </div>
      ),
    },
    {
      key: "position",
      header: "Position",
      cellStyle: { fontSize: 13, color: "var(--kh-ink-600)" },
      cell: (s) => s.position_name || "Not specified",
    },
    {
      key: "department_name",
      header: "Department",
      cellStyle: { fontSize: 13, color: "var(--kh-ink-500)" },
      cell: (s) => s.dept,
    },
    {
      key: "created_at",
      header: "Joined",
      cellStyle: { fontSize: 12, color: "var(--kh-ink-400)" },
      cell: (s) => new Date(s.created_at).toLocaleDateString(),
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
    }
  ]

  const staff: StaffRow[] = users.map((u) => {
    const color = avatarColor(u.id)
    return {
      id: u.id,
      initials: initials(u.name, u.lastname),
      color,
      name: `${u.name} ${u.lastname}`,
      position_name: u.position_name ?? "Not specified",
      dept: u.department_name ?? "No department",
      status: u.is_active ? "Active" : "Inactive",
      created_at: u.created_at,
    }
  })

  // const deptCounts = departments.map((d) => ({
  //   name: d.name,
  //   color: avatarColor(d.id),
  //   count: workTracking.filter((w) => w.department_id === d.id && !w.end_date).length,
  // }))

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
          <AddStaffModal />
        </div>
      </header>

      <div className="kh-content">
        {/* <div style={{ marginBottom: 6 }}>
          <h1 className="kh-h1">Staff</h1>
          <p className="kh-sub">{staff.length} members · {departments.length} departments · {activeCount} active</p>
        </div> */}

        {/* {deptCounts.length > 0 && (
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
        )} */}

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