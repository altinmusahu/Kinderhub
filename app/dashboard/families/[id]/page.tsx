import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { verifyToken, cookieName } from "@/lib/auth"
import { FamiliesService } from "@/app/api/modules/families/families.service"
import { avatarColor } from "@/components/ui/helper"
import FamilyTabs from "./FamilyTabs"
import MobileMenuButton from "@/app/components/dashboard/MobileMenuButton"
import { KhTooltip } from "@/components/ui/KhTooltip"
import { AccessDenied } from "@/app/components/dashboard/AccessDenied"
import { can } from "@/lib/permissions/can"

function familyInitials(name: string) {
  return name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase()
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Active:   { bg: "#E8F5EC", color: "#3A8C50" },
  Waitlist: { bg: "#FEF3E2", color: "#B07A1A" },
  Paused:   { bg: "#F0EDE8", color: "#7A7368" },
}

export default async function FamilyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const store = await cookies()
  const token = store.get(cookieName())?.value ?? null
  if (!token) redirect("/login")
  const session = await verifyToken(token)
  if (!session) redirect("/login")
  const { tenant_id } = session

  let family
  try {
    family = await FamiliesService.getByIdWithDetails(id, tenant_id)
  } catch {
    return notFound()
  }

  const canView = await can(session, "families", "view", id)
  if (!canView) return <AccessDenied />
  const canEdit = await can(session, "families", "edit", id)

  const color = avatarColor(family.id)
  const sc = STATUS_COLORS[family.status] ?? STATUS_COLORS.Active
  const sinceDate = new Date(family.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  })
  const primaryParent = family.parents[0]
  const primaryContact = primaryParent
    ? `${primaryParent.firstname} ${primaryParent.lastname}`
    : null

  return (
    <div className="kh-page">
      <header className="kh-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MobileMenuButton />
          <nav className="kh-breadcrumb">
            <span className="kh-breadcrumb-parent">Kinderhub</span>
            <span className="kh-breadcrumb-sep">/</span>
            <Link href="/dashboard/families" className="kh-breadcrumb-parent" style={{ textDecoration: "none" }}>
              Families
            </Link>
            <span className="kh-breadcrumb-sep">/</span>
            <span className="kh-breadcrumb-current">{family.name}</span>
          </nav>
        </div>
        <div className="kh-topbar-right">
          <Link href="/dashboard/families">
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
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", paddingBottom: 20, flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{
              width: 80, height: 80, borderRadius: 18,
              background: color + "33",
              border: "3px solid var(--kh-surface)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 700, color, flexShrink: 0,
            }}>
              {familyInitials(family.name)}
            </div>

            {/* Name + meta */}
            <div style={{ flex: 1, paddingTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 className="kh-h1" style={{ margin: 0 }}>{family.name}</h1>
                <span className="kh-status-badge" style={{ background: sc.bg, color: sc.color }}>
                  <span className="kh-pill-dot" style={{ background: sc.color }} />
                  {family.status}
                </span>
                <KhTooltip label="What do family statuses mean?">
                  Active families are currently enrolled, Waitlist families are waiting for a spot, and Paused families have temporarily stopped attending.
                </KhTooltip>
              </div>
              <div style={{ fontSize: 13.5, color: "var(--kh-ink-600)", marginTop: 3 }}>
                {family.plan}
              </div>
              <div style={{ display: "flex", gap: 18, marginTop: 10, fontSize: 12, color: "var(--kh-ink-500)", flexWrap: "wrap" }}>
                {primaryContact && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
                    </svg>
                    {primaryContact}
                  </span>
                )}
                {primaryParent?.phone_number && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--kh-font-mono)" }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 2h3l1.5 3.5-1.5 1a8 8 0 004 4l1-1.5L14.5 10V13c0 .5-.5 1-1 1A11 11 0 012 3c0-.5.5-1 1-1z"/>
                    </svg>
                    {primaryParent.phone_number}
                  </span>
                )}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--kh-font-mono)", fontSize: 11 }}>
                  ID: {family.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{
              display: "flex", gap: 20, padding: "12px 16px",
              background: "var(--kh-surface)", border: "1px solid var(--kh-border)",
              borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              flexShrink: 0, flexWrap: "wrap",
            }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>Children</div>
                <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 28, color: "var(--kh-ink-900)", marginTop: 4, lineHeight: 1 }}>
                  {family.kids.length}
                </div>
                <div style={{ fontSize: 11, color: "var(--kh-ink-400)", marginTop: 2 }}>enrolled</div>
              </div>
              <div style={{ width: 1, background: "var(--kh-border)" }} />
              <div>
                <div style={{ fontSize: 10, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>Parents</div>
                <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 28, color: "var(--kh-ink-900)", marginTop: 4, lineHeight: 1 }}>
                  {family.parents.length}
                </div>
                <div style={{ fontSize: 11, color: "var(--kh-ink-400)", marginTop: 2 }}>guardians</div>
              </div>
              <div style={{ width: 1, background: "var(--kh-border)" }} />
              <div>
                <div style={{ fontSize: 10, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em", display: "flex", alignItems: "center" }}>
                  Balance
                  <KhTooltip label="What is Balance?">
                    The amount this family currently owes. Shown in red when there's an outstanding balance.
                  </KhTooltip>
                </div>
                <div style={{
                  fontFamily: "var(--kh-font-serif)", fontSize: 22, marginTop: 4, lineHeight: 1,
                  color: family.balance > 0 ? "#C0392B" : "var(--kh-sage)",
                }}>
                  ${family.balance.toFixed(2)}
                </div>
                <div style={{ fontSize: 11, color: "var(--kh-ink-400)", marginTop: 2 }}>since {sinceDate}</div>
              </div>
            </div>
          </div>
          <div style={{ height: 1 }} />
        </div>

        {/* Tabs — client */}
        <FamilyTabs family={family} canEdit={canEdit} />
      </div>
    </div>
  )
}
