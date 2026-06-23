import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { verifyToken, cookieName } from "@/lib/auth"
import { UserService } from "@/app/api/modules/user/user.service"
import { avatarColor, initials } from "@/components/ui/helper"

export default async function EmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const store = await cookies()
  const token = store.get(cookieName())?.value ?? null

  if (!token) redirect("/login")

  const session = await verifyToken(token)
  if (!session) redirect("/login")

  const { tenant_id } = session!

  let user
  try {
    user = await UserService.getById(id, tenant_id)
  } catch {
    return notFound()
  }

  if (!user) return notFound()

  const color = avatarColor(user.user.id)
  const userInitials = initials(user.user.name, user.user.lastname)
  const fullName = `${user.user.name} ${user.user.lastname}`
  const joinedDate = new Date(user.user.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  })
  return (
    <div className="kh-page">
      {/* Topbar */}
      <header className="kh-topbar">
        <nav className="kh-breadcrumb">
          <span className="kh-breadcrumb-parent">Kinderhub</span>
          <span className="kh-breadcrumb-sep">/</span>
          <Link href="/dashboard/staff" className="kh-breadcrumb-parent" style={{ textDecoration: "none" }}>
            Staff
          </Link>
          <span className="kh-breadcrumb-sep">/</span>
          <span className="kh-breadcrumb-current">{fullName}</span>
        </nav>
        <div className="kh-topbar-right">
          <Link href="/dashboard/staff">
            <button className="kh-btn">← Back to Staff</button>
          </Link>
        </div>
      </header>

      <div className="kh-content" style={{ padding: 0, overflow: "auto" }}>
        {/* Hero section */}
        <div style={{
          padding: "24px 28px 0",
          background: `linear-gradient(180deg, ${color}18 0%, var(--kh-bg) 80%)`,
          borderBottom: "1px solid var(--kh-border)",
        }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", paddingBottom: 20 }}>
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div style={{
                width: 80, height: 80, borderRadius: 18,
                background: color + "33",
                border: "3px solid var(--kh-surface)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 700, color,
              }}>
                {userInitials}
              </div>
              <span style={{
                position: "absolute", bottom: 2, right: 2,
                width: 16, height: 16, borderRadius: "50%",
                background: user.user.is_active ? "var(--kh-sage)" : "var(--kh-ink-300)",
                border: "2.5px solid var(--kh-surface)",
              }} />
            </div>

            {/* Name + meta */}
            <div style={{ flex: 1, paddingTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 className="kh-h1" style={{ margin: 0 }}>{fullName}</h1>
                <span className="kh-status-badge" style={{
                  background: user.user.is_active ? "#E8F5EC" : "#F0EDE8",
                  color: user.user.is_active ? "#3A8C50" : "#7A7368",
                }}>
                  <span className="kh-pill-dot" style={{ background: user.user.is_active ? "#3A8C50" : "#9E968A" }} />
                  {user.user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div style={{ fontSize: 13.5, color: "var(--kh-ink-600)", marginTop: 3 }}>
                {user.user.role || "Staff Member"}
              </div>
              <div style={{ display: "flex", gap: 18, marginTop: 10, fontSize: 12, color: "var(--kh-ink-500)", flexWrap: "wrap" }}>
                {user.position_name && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    {user.position_name}
                  </span>
                )}
                {user.user.email && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="14" height="10" rx="1.5"/><path d="M1 4l7 5 7-5"/></svg>
                    {user.user.email}
                  </span>
                )}
                {user.user.phone_number && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--kh-font-mono)" }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2h3l1.5 3.5-1.5 1a8 8 0 004 4l1-1.5L14.5 10V13c0 .5-.5 1-1 1A11 11 0 012 3c0-.5.5-1 1-1z"/></svg>
                    {user.user.phone_number}
                  </span>
                )}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--kh-font-mono)", fontSize: 11 }}>
                  ID: {user.user.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{
              display: "flex", gap: 24, padding: "14px 20px",
              background: "var(--kh-surface)", border: "1px solid var(--kh-border)",
              borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>Joined</div>
                <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 18, color: "var(--kh-ink-900)", marginTop: 4 }}>
                  {new Date(user.user.created_at).getFullYear()}
                </div>
                <div style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>since {joinedDate}</div>
              </div>
              <div style={{ width: 1, background: "var(--kh-border)" }} />
              <div>
                <div style={{ fontSize: 10, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>Status</div>
                <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 18, color: user.user.is_active ? "var(--kh-sage)" : "var(--kh-ink-400)", marginTop: 4 }}>
                  {user.user.is_active ? "Active" : "Inactive"}
                </div>
                <div style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>employment</div>
              </div>
              <div style={{ width: 1, background: "var(--kh-border)" }} />
              <div>
                <div style={{ fontSize: 10, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>Role</div>
                <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 18, color: "var(--kh-ink-900)", marginTop: 4 }}>
                  {user.user.role ? user.user.role.slice(0, 1).toUpperCase() : "—"}
                </div>
                <div style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>{user.user.role || "not set"}</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 18 }}>
            {["Overview", "Schedule", "Documents", "Notes"].map((t, i) => (
              <div key={t} style={{
                padding: "8px 2px", fontSize: 13,
                color: i === 0 ? "var(--kh-ink-900)" : "var(--kh-ink-500)",
                fontWeight: i === 0 ? 600 : 500,
                borderBottom: i === 0 ? "2px solid var(--kh-peach)" : "2px solid transparent",
                cursor: "pointer",
              }}>{t}</div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 28px 40px", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, alignItems: "start" }}>

          {/* LEFT column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Personal Information */}
            <div className="kh-card">
              <div className="kh-card-header">
                <span className="kh-card-title">Personal Information</span>
              </div>
              <div style={{ padding: "4px 18px 14px" }}>
                <InfoRow label="Full name" value={fullName} />
                <InfoRow label="Email" value={user.user.email} mono />
                <InfoRow label="Phone" value={user.user.phone_number || "—"} mono />
                <InfoRow label="Personal No." value={user.user.personal_number || "—"} mono />
                <InfoRow label="Date of birth" value={user.user.date_of_birth} mono />
              </div>
            </div>

            {/* Account Details */}
            <div className="kh-card">
              <div className="kh-card-header">
                <span className="kh-card-title">Account Details</span>
              </div>
              <div style={{ padding: "4px 18px 14px" }}>
                <InfoRow label="Employee ID" value={user.user.id} mono />
                <InfoRow label="Role" value={user.user.role || "—"} />
                <InfoRow label="Joined" value={user.user.created_at} mono />
                <InfoRow label="First login" value={user.user.is_first_login_executed ? "Completed" : "Pending"} />
              </div>
            </div>
          </div>

          {/* RIGHT column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Employment */}
            <div className="kh-card">
              <div className="kh-card-header">
                <span className="kh-card-title">Employment</span>
              </div>
              <div style={{ padding: "4px 18px 14px" }}>
                {/* <InfoRow label="Status" value={user.user.is_active ? "Active" : "Inactive"} /> */}
                <InfoRow label="Company name" value={user.tenant_name ? user.tenant_name : ""} mono />
                <InfoRow label="Department name" value={user.department_name ? user.department_name : ""} mono />
                <InfoRow label="Position name" value={user.position_name ? user.position_name : ""} mono />
                <InfoRow label="Start date" value={user.start_date ? user.start_date : ""} mono />
                <InfoRow label="Responsible user name" value={user.responsible_user_name ? user.responsible_user_name : ""} mono />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "130px 1fr", gap: 10,
      padding: "9px 0", borderTop: "1px solid var(--kh-border-soft)", fontSize: 12.5,
    }}>
      <span style={{ color: "var(--kh-ink-400)" }}>{label}</span>
      <span
        style={{
          color: "var(--kh-ink-800)",
          fontFamily: mono ? "var(--kh-font-mono)" : undefined,
          fontSize: mono ? 11.5 : undefined,
          wordBreak: "break-all",
        }}
      >
        {value}
      </span>
    </div>
  )
}
