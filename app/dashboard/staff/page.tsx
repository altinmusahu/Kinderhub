import { cookies } from "next/headers"
import Link from "next/link"
import { DataTable, Column } from "@/app/components/dashboard/DataTable"
import AddStaffModal from "@/components/ui/AddStaffModal"
import ExportStaffButton from "@/app/components/dashboard/ExportStaffButton"
import { UserService } from "@/app/api/modules/user/user.service"
import { verifyToken, cookieName } from "@/lib/auth"
import { redirect } from "next/navigation"
import { avatarColor, initials } from "@/components/ui/helper"
import { UserWithWorkTrackingAndDepartment } from "@/app/api/modules/user/user.types"
import MobileMenuButton from "@/app/components/dashboard/MobileMenuButton"
import { AccessDenied } from "@/app/components/dashboard/AccessDenied"
import { hasAnyAccess } from "@/lib/permissions/can"

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

  const [users] = await Promise.all([
    UserService.getUsersWithWorkTrackingAndDepartment(tenant_id),
  ])

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
      key: "position",
      header: "Position",
      cellStyle: { fontSize: 13, color: "var(--kh-ink-600)" },
      cell: (s) => s.position_name || "—",
    },
    {
      key: "department_name",
      header: "Department",
      cellStyle: { fontSize: 13, color: "var(--kh-ink-500)" },
      cell: (s) => s.department_name || "—",
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
          background: s.is_active === true ? "#E8F5EC" : "#F0EDE8",
          color: s.is_active === true ? "#3A8C50" : "#7A7368",
        }}>
          <span className="kh-pill-dot" style={{ background: s.is_active === true ? "#3A8C50" : "#9E968A" }} />
          { s.is_active === true ? "Active" : "Inactive"}
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
          <button className="kh-btn">≡ Filter</button>
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