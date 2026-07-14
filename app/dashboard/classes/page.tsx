import Link from "next/link"
import { CalendarDays } from "lucide-react"
import AddClassModal from "@/components/ui/AddClassModal"
import { ClassesService } from "@/app/api/modules/classes/classes.service"
import type { ClassWithRelations } from "@/app/api/modules/classes/classes.types"
import MobileMenuButton from "@/app/components/dashboard/MobileMenuButton"
import { AccessDenied } from "@/app/components/dashboard/AccessDenied"
import { hasAnyAccess } from "@/lib/permissions/can"
import { getTenant } from "@/lib/get-tenant"

function initials(name: string | null): string {
  if (!name) return "?"
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()
}

function formatTime(t: string): string {
  return t?.slice(0, 5) ?? t
}

type DaySchedule = { opens: string; closes: string }

const WEEK_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function groupByTimes(schedule: Record<string, unknown>): { days: string[]; time: DaySchedule }[] {
  const groups: { days: string[]; time: DaySchedule }[] = []
  for (const day of WEEK_ORDER) {
    const entry = schedule[day] as DaySchedule | undefined
    if (!entry) continue
    const last = groups[groups.length - 1]
    if (last && last.time.opens === entry.opens && last.time.closes === entry.closes) {
      last.days.push(day)
    } else {
      groups.push({ days: [day], time: entry })
    }
  }
  return groups
}

function formatScheduleSummary(schedule: Record<string, unknown> | null): string {
  if (!schedule) return ""
  if (Object.keys(schedule).length === 0) return ""

  const groups = groupByTimes(schedule)

  return groups.map(({ days, time }) => {
    const label = days.length > 2
      ? `${days[0].slice(0, 3)}–${days[days.length - 1].slice(0, 3)}`
      : days.map(d => d.slice(0, 3)).join(", ")
    return `${label} · ${time.opens}–${time.closes}`
  }).join(" · ")
}

const CARD_COLORS = [
  "#E8866A", "#6BA07C", "#C9AE4E", "#D97F8C",
  "#6A9EC8", "#A07CB4", "#7FA06A", "#8FB7C9",
]

function colorFor(index: number): string {
  return CARD_COLORS[index % CARD_COLORS.length]
}

function ClassCard({ cls, color }: { cls: ClassWithRelations; color: string }) {
  const capacity = Number(cls.capacity) || 0
  const pct = capacity > 0 ? Math.min(100, Math.round((cls.enrolled_count / capacity) * 100)) : 0
  const isFull = capacity > 0 && cls.enrolled_count >= capacity

  return (
    <Link href={`/dashboard/classes/${cls.id}`} style={{ textDecoration: "none" }}>
    <div className="kh-card kh-class-card" style={{ padding: "18px 20px", background: `linear-gradient(180deg, ${color}26, var(--kh-surface) 65%)`, borderColor: `${color}40` }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: "var(--kh-ink-900)" }}>{cls.name}</span>
          <span style={{ fontSize: 12, color: "var(--kh-ink-400)" }}>{cls.average_year}</span>
        </div>
        {isFull && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: "#B07A1A", background: "#FEF3E2", borderRadius: 99, padding: "2px 8px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#B07A1A", flexShrink: 0 }} />
            At capacity
          </span>
        )}
      </div>

      {/* Meta */}
      <div style={{ fontSize: 12, color: "var(--kh-ink-400)", marginBottom: 14, display: "flex", flexDirection: "column", gap: 4 }}>
        {cls.location_name && <span>📍 {cls.location_name}</span>}
        {cls.schedule
          ? <span>🕐 {formatScheduleSummary(cls.schedule)}</span>
          : <span>🕐 {formatTime(cls.starts_at)}–{formatTime(cls.ends_at)}</span>
        }
      </div>

      {/* Capacity bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--kh-ink-500)", marginBottom: 5 }}>
          <span>Enrolled</span>
          <span style={{ fontFamily: "var(--kh-font-mono)" }}>{cls.enrolled_count} / {cls.capacity}</span>
        </div>
        <div className="kh-room-bar">
          <div className="kh-room-bar-fill" style={{ width: pct + "%", background: color }} />
        </div>
      </div>

      {/* Staff + waitlist */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em", color: "var(--kh-ink-400)", marginBottom: 5 }}>Lead</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--kh-ink-700)" }}>
            <span className="kh-avatar" style={{ background: color + "22", color, width: 22, height: 22, fontSize: 9 }}>
              {initials(cls.lead_name)}
            </span>
            {cls.lead_name ?? "—"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em", color: "var(--kh-ink-400)", marginBottom: 5 }}>Assistant</div>
          {cls.assistant_name ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--kh-ink-700)" }}>
              <span className="kh-avatar" style={{ background: color + "22", color, width: 22, height: 22, fontSize: 9 }}>
                {initials(cls.assistant_name)}
              </span>
              {cls.assistant_name}
            </div>
          ) : (
            <span style={{ fontSize: 12, color: "var(--kh-ink-400)" }}>Unstaffed</span>
          )}
        </div>
        <div>
          <div style={{ fontSize: 10, fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em", color: "var(--kh-ink-400)", marginBottom: 5 }}>Waitlist</div>
          <div style={{ fontSize: 12, color: "var(--kh-ink-700)" }}>
            <span style={{ fontFamily: "var(--kh-font-mono)", fontWeight: 600 }}>{cls.waitlist_count}</span> famil{cls.waitlist_count === 1 ? "y" : "ies"}
          </div>
        </div>
      </div>
    </div>
    </Link>
  )
}

export default async function ClassesPage() {
  const session = await getTenant()
  const allowed = await hasAnyAccess(session, "classes")
  if (!allowed) return <AccessDenied />

  let classes: ClassWithRelations[] = []
  try {
    classes = await ClassesService.getAll()
  } catch {
    // renders empty state below
  }

  const totalEnrolled = classes.reduce((sum, c) => sum + c.enrolled_count, 0)
  const totalWaitlist = classes.reduce((sum, c) => sum + c.waitlist_count, 0)

  return (
    <div className="kh-page">
      <header className="kh-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MobileMenuButton />
          <nav className="kh-breadcrumb">
            <span className="kh-breadcrumb-parent">Kinderhub</span>
            <span className="kh-breadcrumb-sep">/</span>
            <span className="kh-breadcrumb-current">Classes</span>
          </nav>
        </div>
        {/* <div className="kh-topbar-right">
          <button className="kh-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
            <CalendarDays size={13} /> <span className="kh-btn-label">Week view</span>
          </button>
        </div> */}
        <AddClassModal />
      </header>

      <div className="kh-content">
        <div style={{ marginBottom: 16 }}>
          <h1 className="kh-h1">Classes</h1>
          <p className="kh-sub">
            {classes.length} classroom{classes.length !== 1 ? "s" : ""} · {totalEnrolled} enrolled · {totalWaitlist} on waitlist
          </p>
        </div>

        {classes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--kh-ink-400)", fontSize: 14 }}>
            No classes yet. Create your first one with the button above.
          </div>
        ) : (
          <div className="kh-classes-grid">
            {classes.map((cls, i) => (
              <ClassCard key={cls.id} cls={cls} color={colorFor(i)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}