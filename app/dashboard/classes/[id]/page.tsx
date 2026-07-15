import Link from "next/link"
import { Mail } from "lucide-react"
import { ClassesService } from "@/app/api/modules/classes/classes.service"
import { KidsService } from "@/app/api/modules/kids/kids.service"
import { WaitlistService } from "@/app/api/modules/waitlist/waitlist.service"
import { getTenant } from "@/lib/get-tenant"
import type { Kids } from "@/app/api/modules/kids/kids.types"
import type { ClassWithRelations } from "@/app/api/modules/classes/classes.types"
import type { WaitlistEntry } from "@/app/api/modules/waitlist/waitlist.types"
import ClassTabs from "./ClassTabs"
import TakeAttendanceButton from "./TakeAttendanceButton"
import MobileMenuButton from "@/app/components/dashboard/MobileMenuButton"
import { KhTooltip } from "@/components/ui/KhTooltip"
import { AccessDenied } from "@/app/components/dashboard/AccessDenied"
import { can } from "@/lib/permissions/can"

// ── KPI ring ─────────────────────────────────────────────────

const CIRCUMFERENCE = 2 * Math.PI * 24

function CapacityRing({ enrolled, capacity }: { enrolled: number; capacity: number }) {
  const safe = capacity > 0 ? capacity : 1
  const arc = CIRCUMFERENCE * Math.min(enrolled / safe, 1)
  return (
    <div style={{ display: "flex", gap: 14, padding: "12px 18px", background: "var(--kh-surface)", border: "1px solid var(--kh-ink-100)", borderRadius: 14, boxShadow: "var(--kh-shadow-sm)", alignItems: "center" }}>
      <div style={{ position: "relative", width: 58, height: 58 }}>
        <svg width="58" height="58" viewBox="0 0 58 58" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="29" cy="29" r="24" fill="none" stroke="var(--kh-ink-100)" strokeWidth="7" />
          <circle cx="29" cy="29" r="24" fill="none" stroke="var(--kh-peach)" strokeWidth="7" strokeLinecap="round"
            strokeDasharray={`${arc} ${CIRCUMFERENCE}`} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "var(--kh-font-mono)", fontSize: 15, fontWeight: 600, color: "var(--kh-ink-900)" }}>{enrolled}</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em", display: "flex", alignItems: "center" }}>
          Enrolled
          <KhTooltip label="What does this show?">
            How many children are currently enrolled compared to this class&apos;s total capacity.
          </KhTooltip>
        </div>
        <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 22, color: "var(--kh-ink-900)", lineHeight: 1 }}>{enrolled} / {capacity}</div>
        <div style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>{Math.max(0, capacity - enrolled)} spot{Math.max(0, capacity - enrolled) !== 1 ? "s" : ""} open</div>
      </div>
    </div>
  )
}

function Pill({ text, bg, color, dot }: { text: string; bg: string; color: string; dot?: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 8px", borderRadius: 999,
      background: bg, color, fontSize: 11.5, fontWeight: 500, whiteSpace: "nowrap",
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />}
      {text}
    </span>
  )
}

// ── Page ─────────────────────────────────────────────────────

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Step 1: auth — let this throw to middleware if unauthorized
  let tenant_id: string
  let session: Awaited<ReturnType<typeof getTenant>>
  try {
    session = await getTenant()
    tenant_id = session.tenant_id
  } catch {
    return (
      <div style={{ padding: "48px 26px", textAlign: "center", fontSize: 14, color: "var(--kh-ink-400)" }}>
        Unauthorized. Please <Link href="/login" style={{ color: "var(--kh-peach)" }}>log in</Link>.
      </div>
    )
  }

  // Step 2: fetch class — separate so we can distinguish not-found from other errors
  let cls: ClassWithRelations | null = null
  try {
    cls = await ClassesService.getById(id)
  } catch {
    // DB or network error — cls stays null
  }

  let canViewAttendance = false
  let canEditAttendance = false
  let canViewIncidents = false
  let canEditIncidents = false
  let canDeleteIncidents = false
  let canViewCurriculum = false
  let canEditCurriculum = false
  let canDeleteCurriculum = false
  let canViewHub = false
  let canEditHub = false
  let canDeleteHub = false
  if (cls) {
    const canView = await can(session, "classes", "view", id)
    if (!canView) return <AccessDenied />
    canViewAttendance = await can(session, "attendance", "view", id)
    canEditAttendance = await can(session, "attendance", "edit", id)
    canViewIncidents = await can(session, "incidents", "view", { class_id: id })
    canEditIncidents = await can(session, "incidents", "edit", { class_id: id })
    canDeleteIncidents = await can(session, "incidents", "full", { class_id: id })
    canViewCurriculum = await can(session, "curriculum", "view", id)
    canEditCurriculum = await can(session, "curriculum", "edit", id)
    canDeleteCurriculum = await can(session, "curriculum", "full", id)
    canViewHub = await can(session, "hub", "view", id)
    canEditHub = await can(session, "hub", "edit", id)
    canDeleteHub = await can(session, "hub", "full", id)
  }

  if (!cls) {
    return (
      <div className="kh-page" style={{ padding: 0 }}>
        <header className="kh-topbar">
          <nav className="kh-breadcrumb">
            <span className="kh-breadcrumb-parent">Kinderhub</span>
            <span className="kh-breadcrumb-sep">/</span>
            <Link href="/dashboard/classes" className="kh-breadcrumb-parent" style={{ textDecoration: "none" }}>Classes</Link>
            <span className="kh-breadcrumb-sep">/</span>
            <span className="kh-breadcrumb-current">Not found</span>
          </nav>
        </header>
        <div style={{ padding: "48px 26px", textAlign: "center", fontSize: 14, color: "var(--kh-ink-400)" }}>
          Class not found.
        </div>
      </div>
    )
  }

  // Step 3: fetch roster + waitlist in parallel (non-fatal)
  let roster: Kids[] = []
  let waitlist: WaitlistEntry[] = []
  try {
    [roster, waitlist] = await Promise.all([
      KidsService.getKidsByClassId(tenant_id, id),
      WaitlistService.getByClassId(tenant_id, id),
    ])
  } catch (err) {
    console.error("[ClassDetailPage] failed to fetch roster/waitlist:", err)
  }

  return (
    <div className="kh-page" style={{ padding: 0 }}>

      {/* Topbar */}
      <header className="kh-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MobileMenuButton />
          <nav className="kh-breadcrumb">
            <span className="kh-breadcrumb-parent">Kinderhub</span>
            <span className="kh-breadcrumb-sep">/</span>
            <Link href="/dashboard/classes" className="kh-breadcrumb-parent" style={{ textDecoration: "none" }}>Classes</Link>
            <span className="kh-breadcrumb-sep">/</span>
            <span className="kh-breadcrumb-current">{cls.name}</span>
          </nav>
        </div>
        <div className="kh-topbar-right">
          <button className="kh-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
            <Mail size={13} /> <span className="kh-btn-label">Message room</span>
          </button>
          {canViewAttendance && <TakeAttendanceButton classId={id} className={cls.name} readOnly={!canEditAttendance} />}
        </div>
      </header>

      {/* Class hero header */}
      <div style={{
        padding: "16px 16px 14px",
        background: "linear-gradient(180deg, var(--kh-peach-bg) 0%, transparent 78%)",
        borderBottom: "1px solid var(--kh-ink-100)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>

          {/* Class icon */}
          <div style={{
            width: 64, height: 64, borderRadius: 18, flexShrink: 0,
            background: "linear-gradient(150deg, var(--kh-peach-l), var(--kh-peach))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "var(--kh-shadow-md)",
          }}>
            <span style={{ fontFamily: "var(--kh-font-serif)", fontSize: 26, color: "#fff" }}>
              {cls.name[0]}
            </span>
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontFamily: "var(--kh-font-serif)", fontSize: 30, fontWeight: 400, color: "var(--kh-ink-900)", letterSpacing: "-0.015em" }}>
                {cls.name}
              </h1>
              <Pill text="Active" bg="var(--kh-sage-bg)" color="var(--kh-sage-d)" dot="var(--kh-sage)" />
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12.5, color: "var(--kh-ink-500)", flexWrap: "wrap" }}>
              {cls.location_name && <span>{cls.location_name}</span>}
              {cls.lead_name && <span>Lead: {cls.lead_name}</span>}
              <span style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11 }}>ID:{cls.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>

          <CapacityRing enrolled={roster.length} capacity={cls.capacity} />
        </div>
      </div>

      {/* Tabs + content (client component for interactivity) */}
      <ClassTabs
        cls={cls}
        roster={roster}
        waitlist={waitlist}
        classId={id}
        canViewIncidents={canViewIncidents}
        canEditIncidents={canEditIncidents}
        canDeleteIncidents={canDeleteIncidents}
        canViewCurriculum={canViewCurriculum}
        canEditCurriculum={canEditCurriculum}
        canDeleteCurriculum={canDeleteCurriculum}
        canViewHub={canViewHub}
        canEditHub={canEditHub}
        canDeleteHub={canDeleteHub}
      />
    </div>
  )
}
