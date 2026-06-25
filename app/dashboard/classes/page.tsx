import Link from "next/link"
import AddClassModal from "@/components/ui/AddClassModal"
import { ClassesService } from "@/app/api/modules/classes/classes.service"
import type { ClassWithRelations } from "@/app/api/modules/classes/classes.types"

function initials(name: string | null): string {
  if (!name) return "?"
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()
}

function formatTime(t: string): string {
  return t?.slice(0, 5) ?? t
}

type DaySchedule = { opens: string; closes: string }

function formatScheduleSummary(schedule: Record<string, unknown> | null): string {
  if (!schedule) return ""
  const days = Object.keys(schedule)
  if (days.length === 0) return ""
  // Check if all days have identical times
  const entries = Object.values(schedule) as DaySchedule[]
  const allSame = entries.every(e => e.opens === entries[0].opens && e.closes === entries[0].closes)
  if (allSame) {
    const abbr = days.map(d => d.slice(0, 3)).join(", ")
    return `${abbr} · ${entries[0].opens}–${entries[0].closes}`
  }
  return days.map(d => {
    const e = schedule[d] as DaySchedule
    return `${d.slice(0, 3)} ${e.opens}–${e.closes}`
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
  const pct = Math.min(100, Math.round((0 / Number(cls.capacity)) * 100))
  const isFull = false

  return (
    <Link href={`/dashboard/classes/${cls.id}`} style={{ textDecoration: "none" }}>
    <div className="kh-card kh-class-card" style={{ padding: "18px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: "var(--kh-ink-900)" }}>{cls.name}</span>
          <span style={{ fontSize: 12, color: "var(--kh-ink-400)" }}>{cls.average_year}</span>
          {isFull && (
            <span style={{ fontSize: 11, fontWeight: 500, color: "#B07A1A", background: "#FEF3E2", borderRadius: 99, padding: "2px 8px" }}>
              ● At capacity
            </span>
          )}
        </div>
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
          <span style={{ fontFamily: "var(--kh-font-mono)" }}>— / {cls.capacity}</span>
        </div>
        <div className="kh-room-bar">
          <div className="kh-room-bar-fill" style={{ width: pct + "%", background: color }} />
        </div>
      </div>

      {/* Staff */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
      </div>
    </div>
    </Link>
  )
}

export default async function ClassesPage() {
  let classes: ClassWithRelations[] = []
  try {
    classes = await ClassesService.getAll()
  } catch {
    // renders empty state below
  }

  return (
    <div className="kh-page">
      <header className="kh-topbar">
        <nav className="kh-breadcrumb">
          <span className="kh-breadcrumb-parent">Kinderhub</span>
          <span className="kh-breadcrumb-sep">/</span>
          <span className="kh-breadcrumb-current">Classes</span>
        </nav>
        <div className="kh-topbar-right">
          <AddClassModal />
        </div>
      </header>

      <div className="kh-content">
        <div style={{ marginBottom: 16 }}>
          <h1 className="kh-h1">Classes</h1>
          <p className="kh-sub">{classes.length} classroom{classes.length !== 1 ? "s" : ""}</p>
        </div>

        {classes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--kh-ink-400)", fontSize: 14 }}>
            No classes yet. Create your first one with the button above.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {classes.map((cls, i) => (
              <ClassCard key={cls.id} cls={cls} color={colorFor(i)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}