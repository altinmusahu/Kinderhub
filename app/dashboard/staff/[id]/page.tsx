import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { verifyToken, cookieName } from "@/lib/auth"
import { UserService } from "@/app/api/modules/user/user.service"
import { SalaryTrackingService } from "@/app/api/modules/salary_tracking/salary_tracking.service"
import { UserProfilesService } from "@/app/api/modules/user_profiles/user_profiles.service"
import { UserProfilesRepository } from "@/app/api/modules/user_profiles/user_profiles.repository"
import { avatarColor, initials } from "@/components/ui/helper"
import EmployeeTabs from "./EmployeeTabs"
import MobileMenuButton from "@/app/components/dashboard/MobileMenuButton"
import { ProfileAvatar } from "./components/ProfileAvatar"
import { AccessDenied } from "@/app/components/dashboard/AccessDenied"
import { can } from "@/lib/permissions/can"

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

  const canView = await can(session, "staff", "view", id)
  if (!canView) return <AccessDenied />
  const canEdit = await can(session, "staff", "edit", id)

  const activeSalary = await SalaryTrackingService.getActiveByUser(id)
  const profilePicture = await UserProfilesService.getByUser(id)
  const profilePictureUrl = profilePicture ? UserProfilesRepository.getPublicUrl(profilePicture.file_url) : null

  const color = avatarColor(user.user.id)
  const userInitials = initials(user.user.name, user.user.lastname)
  const fullName = `${user.user.name} ${user.user.lastname}`
  const joinedDate = new Date(user.user.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  })
  const tenureYears = (Math.floor(
    (Date.now() - new Date(user.user.created_at).getTime()) / (365.25 * 86_400_000) * 10
  ) / 10).toFixed(1).replace(/\.0$/, "")

  return (
    <div className="kh-page">
      <header className="kh-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MobileMenuButton />
          <nav className="kh-breadcrumb">
            <span className="kh-breadcrumb-parent">Kinderhub</span>
            <span className="kh-breadcrumb-sep">/</span>
            <Link href="/dashboard/staff" className="kh-breadcrumb-parent" style={{ textDecoration: "none" }}>
              Staff
            </Link>
            <span className="kh-breadcrumb-sep">/</span>
            <span className="kh-breadcrumb-current">{fullName}</span>
          </nav>
        </div>
        <div className="kh-topbar-right">
          <Link href="/dashboard/messages">
            <button className="kh-btn">✉ Message</button>
          </Link>
          <Link href={`/dashboard/staff/${id}?tab=Schedule`}>
            <button className="kh-btn">🗓 Schedule</button>
          </Link>
          <Link href="/dashboard/staff">
            <button className="kh-btn">← Back</button>
          </Link>
        </div>
      </header>

      <div className="kh-content" style={{ padding: 0, overflow: "auto" }}>
        {/* Hero */}
        <div style={{
          padding: "24px 28px 0",
          background: `linear-gradient(180deg, ${color}18 0%, var(--kh-bg) 80%)`,
          borderBottom: "1px solid var(--kh-border)",
        }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", paddingBottom: 20 }}>
            {/* Avatar */}
            <ProfileAvatar
              userId={id}
              color={color}
              initials={userInitials}
              isActive={user.user.is_active}
              initialUrl={profilePictureUrl}
            />

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
                {[user.user.role || "Staff Member", user.department_name, user.position_name].filter(Boolean).join(" · ")}
              </div>
              <div style={{ display: "flex", gap: 18, marginTop: 10, fontSize: 12, color: "var(--kh-ink-500)", flexWrap: "wrap" }}>
                {user.user.email && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="1" y="3" width="14" height="10" rx="1.5"/><path d="M1 4l7 5 7-5"/>
                    </svg>
                    {user.user.email}
                  </span>
                )}
                {user.user.phone_number && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--kh-font-mono)" }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 2h3l1.5 3.5-1.5 1a8 8 0 004 4l1-1.5L14.5 10V13c0 .5-.5 1-1 1A11 11 0 012 3c0-.5.5-1 1-1z"/>
                    </svg>
                    {user.user.phone_number}
                  </span>
                )}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--kh-font-mono)", fontSize: 11 }}>
                  {user.user.role || "Staff Member"} · ID: {user.user.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Quick stats — only tiles backed by real data (no time-clock/attendance tracking yet) */}
            <div style={{
              display: "flex", gap: 24, padding: "14px 20px",
              background: "var(--kh-surface)", border: "1px solid var(--kh-border)",
              borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>Tenure</div>
                <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 18, color: "var(--kh-ink-900)", marginTop: 4 }}>
                  {tenureYears} yr
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
                <div style={{ fontSize: 10, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>Salary</div>
                <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 18, color: "var(--kh-ink-900)", marginTop: 4 }}>
                  {activeSalary ? `${activeSalary.symbol ?? ""}${Number(activeSalary.salary).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                </div>
                <div style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>
                  {activeSalary ? `since ${new Date(activeSalary.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "not set"}
                </div>
              </div>
            </div>
          </div>

          {/* Tab strip lives in EmployeeTabs (client) — placeholder border only */}
          <div style={{ height: 1 }} />
        </div>

        {/* All tabs + content — client component */}
        <EmployeeTabs user={user} userId={id} canEdit={canEdit} viewerRole={session.role} />
      </div>
    </div>
  )
}
