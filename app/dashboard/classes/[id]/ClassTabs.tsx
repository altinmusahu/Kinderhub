"use client"

import { useEffect, useRef, useState } from "react"
import type { ClassWithRelations } from "@/app/api/modules/classes/classes.types"
import type { Kids } from "@/app/api/modules/kids/kids.types"
import type { WaitlistEntry } from "@/app/api/modules/waitlist/waitlist.types"
import AddChildButton from "./AddChildButton"
import WaitlistTable from "./WaitlistTable"
import ChecklistTab from "./ChecklistTab"
import CurriculumTab from "./CurriculumTab"
import ProgressTab from "./ProgressTab"
import HubTab from "./HubTab"
import IncidentsTab from "./IncidentsTab"
import AttendanceTab from "./AttendanceTab"
import { Heart, MapPin, Clock, User, Pencil, X, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { KhTooltip } from "@/components/ui/KhTooltip"
import { DocumentsTab } from "./DocumentsTab"

// ── Types for schedule JSON ────────────────────────────────────
type DaySchedule = { opens: string; closes: string }
type Schedule = Partial<Record<string, DaySchedule>>

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const DEFAULT_TIME = { opens: "08:00", closes: "17:30" }

// ── Helpers ───────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()
}

function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: Math.round(size * 0.3),
      background: "var(--kh-peach-bg)", color: "var(--kh-peach-d)",
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>
      {initials(name)}
    </span>
  )
}

function formatAge(dob: string): string {
  const birth = new Date(dob)
  const now = new Date()
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  return months > 0 ? `${years}y ${months}m` : `${years}y`
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  } catch {
    return iso
  }
}

const TABS = ["Roster", "Schedule", "Attendance", "Incidents", "Curriculum", "Checklist", "Progress", "Hub", "Documents"] as const
type Tab = typeof TABS[number]

// ── Tab content components ─────────────────────────────────────

function RosterTab({ cls, roster, classId }: { cls: ClassWithRelations; roster: Kids[]; classId: string }) {
  return (
    <div className="kh-card" style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "14px 16px 10px", borderBottom: "1px solid var(--kh-ink-100)" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Roster</span>
        <span style={{ marginLeft: 8, fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>
          {roster.length} {roster.length === 1 ? "child" : "children"} · capacity {cls.capacity}
        </span>
        <AddChildButton classId={classId} />
      </div>

      {roster.length === 0 ? (
        <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>
          No children assigned to this class yet.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr>
              {["Child", "Gender", "Date of birth", "Age", ""].map((h) => (
                <th key={h} style={{
                  textAlign: "left", fontWeight: 500, color: "var(--kh-ink-400)",
                  fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em",
                  padding: "10px 14px", borderBottom: "1px solid var(--kh-ink-100)",
                  fontFamily: "var(--kh-font-mono)",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roster.map((r) => (
              <tr key={r.id} style={{ cursor: "pointer" }}>
                <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={`${r.firstname} ${r.lastname}`} size={28} />
                    <span style={{ fontWeight: 600, color: "var(--kh-ink-900)" }}>{r.firstname} {r.lastname}</span>
                  </div>
                </td>
                <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)", color: "var(--kh-ink-600)", verticalAlign: "middle" }}>
                  {r.gender}
                </td>
                <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)", fontFamily: "var(--kh-font-mono)", fontSize: 11.5, color: "var(--kh-ink-600)", verticalAlign: "middle" }}>
                  {new Date(r.date_of_birth).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)", fontFamily: "var(--kh-font-mono)", fontSize: 11.5, color: "var(--kh-ink-600)", verticalAlign: "middle" }}>
                  {formatAge(r.date_of_birth)}
                </td>
                <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)", width: 40, verticalAlign: "middle" }}>
                  <span style={{ color: "var(--kh-ink-400)", cursor: "pointer" }}>›</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function ScheduleEditModal({
  classId,
  initial,
  onClose,
  onSaved,
}: {
  classId: string
  initial: Schedule
  onClose: () => void
  onSaved: (s: Schedule) => void
}) {
  const [activeDays, setActiveDays] = useState<string[]>(Object.keys(initial))
  const [schedule, setSchedule] = useState<Schedule>(() => {
    const s: Schedule = {}
    for (const day of ALL_DAYS) {
      s[day] = initial[day] ?? { ...DEFAULT_TIME }
    }
    return s
  })
  const [globalOpens, setGlobalOpens] = useState("08:00")
  const [globalCloses, setGlobalCloses] = useState("17:30")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function toggleDay(day: string) {
    setActiveDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  function setDayTime(day: string, field: "opens" | "closes", value: string) {
    setSchedule(s => ({ ...s, [day]: { ...s[day]!, [field]: value } }))
  }

  function applyToAll() {
    const updated: Schedule = {}
    for (const day of activeDays) {
      updated[day] = { opens: globalOpens, closes: globalCloses }
    }
    setSchedule(s => ({ ...s, ...updated }))
  }

  async function save() {
    if (activeDays.length === 0) { setError("Select at least one day."); return }
    setSaving(true)
    setError("")
    const payload: Schedule = {}
    for (const day of activeDays) {
      payload[day] = schedule[day] ?? { ...DEFAULT_TIME }
    }
    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: payload }),
      })
      if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error ?? "Failed to save."); return }
      onSaved(payload)
      onClose()
    } catch {
      setError("Network error.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(42,32,24,0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: "var(--kh-surface)", borderRadius: 18, width: "100%", maxWidth: 520, boxShadow: "0 24px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", borderBottom: "1px solid var(--kh-ink-100)" }}>
          <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 20, color: "var(--kh-ink-900)", fontWeight: 400 }}>Edit weekly schedule</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--kh-ink-100)", background: "var(--kh-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-ink-500)" }}><X size={14} /></button>
        </div>

        <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Day toggles */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ALL_DAYS.map(day => {
              const on = activeDays.includes(day)
              return (
                <button key={day} type="button" onClick={() => toggleDay(day)} style={{ padding: "5px 11px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 120ms", border: `1px solid ${on ? "#7FA06A" : "var(--kh-border)"}`, background: on ? "#EAF3EC" : "var(--kh-bg)", color: on ? "#2E5E3A" : "var(--kh-ink-400)" }}>
                  {day.slice(0, 3)}
                </button>
              )
            })}
          </div>

          {/* Apply-all row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, background: "var(--kh-ink-50)", border: "1px solid var(--kh-border)" }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--kh-ink-600)", flexShrink: 0 }}>Apply to all:</span>
            <input type="time" value={globalOpens} onChange={e => setGlobalOpens(e.target.value)} style={{ border: "1px solid var(--kh-border)", borderRadius: 7, padding: "4px 8px", fontSize: 12.5, background: "var(--kh-surface)", fontFamily: "var(--kh-font-mono)", outline: "none" }} />
            <span style={{ fontSize: 12, color: "var(--kh-ink-400)" }}>–</span>
            <input type="time" value={globalCloses} onChange={e => setGlobalCloses(e.target.value)} style={{ border: "1px solid var(--kh-border)", borderRadius: 7, padding: "4px 8px", fontSize: 12.5, background: "var(--kh-surface)", fontFamily: "var(--kh-font-mono)", outline: "none" }} />
            <button type="button" onClick={applyToAll} style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, background: "#D2592F", color: "#fff", border: "none", cursor: "pointer", flexShrink: 0 }}>Apply</button>
          </div>

          {/* Per-day rows — only active days */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {activeDays.length === 0 ? (
              <p style={{ fontSize: 12.5, color: "var(--kh-ink-400)", textAlign: "center", padding: "8px 0" }}>Select at least one day above.</p>
            ) : (
              ALL_DAYS.filter(d => activeDays.includes(d)).map(day => {
                const s = schedule[day] ?? DEFAULT_TIME
                return (
                  <div key={day} style={{ display: "grid", gridTemplateColumns: "110px 1fr 14px 1fr", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 9, background: "var(--kh-bg)", border: "1px solid var(--kh-border)" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--kh-ink-800)" }}>{day}</span>
                    <input type="time" value={s.opens} onChange={e => setDayTime(day, "opens", e.target.value)} style={{ border: "1px solid var(--kh-border)", borderRadius: 7, padding: "5px 8px", fontSize: 12.5, background: "var(--kh-surface)", fontFamily: "var(--kh-font-mono)", outline: "none", width: "100%" }} />
                    <span style={{ fontSize: 12, color: "var(--kh-ink-400)", textAlign: "center" }}>–</span>
                    <input type="time" value={s.closes} onChange={e => setDayTime(day, "closes", e.target.value)} style={{ border: "1px solid var(--kh-border)", borderRadius: 7, padding: "5px 8px", fontSize: 12.5, background: "var(--kh-surface)", fontFamily: "var(--kh-font-mono)", outline: "none", width: "100%" }} />
                  </div>
                )
              })
            )}
          </div>

          {error && <p style={{ fontSize: 12.5, color: "#D2592F", margin: 0 }}>{error}</p>}
        </div>

        {/* footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--kh-ink-100)", display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "1px solid var(--kh-ink-200)", background: "var(--kh-bg)", color: "var(--kh-ink-700)", cursor: "pointer" }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", background: saving ? "var(--kh-ink-200)" : "var(--kh-peach)", color: saving ? "var(--kh-ink-400)" : "#fff", cursor: saving ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            {saving ? "Saving…" : <><Check size={13} /> Save schedule</>}
          </button>
        </div>
      </div>
    </div>
  )
}

function ScheduleTab({ cls }: { cls: ClassWithRelations }) {
  const [schedule, setSchedule] = useState<Schedule>((cls.schedule as Schedule) ?? {})
  const [editOpen, setEditOpen] = useState(false)

  const activeDays = ALL_DAYS.filter(d => schedule[d])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 680 }}>

      {/* Info row: class dates + location + staff */}
      <div className="kh-card">
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--kh-ink-100)" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Class info</span>
        </div>
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Start date", icon: <Clock size={13} />, value: cls.starts_at ?? "—" },
            { label: "End date",   icon: <Clock size={13} />, value: cls.ends_at   ?? "—" },
            { label: "Location",   icon: <MapPin size={13} />, value: cls.location_name ?? "—" },
            { label: "Lead",       icon: <User size={13} />,   value: cls.lead_name ?? "—" },
            { label: "Assistant",  icon: <User size={13} />,   value: cls.assistant_name ?? "—" },
          ].map(({ label, icon, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
              <span style={{ color: "var(--kh-ink-400)", display: "flex", alignItems: "center", gap: 6, width: 120, flexShrink: 0 }}>
                {icon}
                <span style={{ fontSize: 11, fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</span>
              </span>
              <span style={{ color: "var(--kh-ink-800)", fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>
        
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--kh-ink-100)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Weekly schedule</span>
          <button
            onClick={() => setEditOpen(true)}
            style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 7, fontSize: 12, fontWeight: 600, border: "1px solid var(--kh-border)", background: "var(--kh-bg)", color: "var(--kh-ink-600)", cursor: "pointer" }}
          >
            <Pencil size={11} /> Edit
          </button>
        </div>

        {activeDays.length === 0 ? (
          <div style={{ padding: "28px 16px", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>
            No weekly schedule set. <button onClick={() => setEditOpen(true)} style={{ background: "none", border: "none", color: "var(--kh-peach-d)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Add one →</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: `140px repeat(${activeDays.length}, 1fr)` }}>
            {/* Header row */}
            <div style={{ padding: "9px 14px", fontSize: 10.5, fontFamily: "var(--kh-font-mono)", color: "var(--kh-ink-400)", textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid var(--kh-ink-100)" }}>Hours</div>
            {activeDays.map(day => (
              <div key={day} style={{ padding: "9px 14px", fontSize: 12, fontWeight: 600, color: "var(--kh-ink-700)", borderLeft: "1px solid var(--kh-ink-100)", borderBottom: "1px solid var(--kh-ink-100)" }}>{day.slice(0, 3)}</div>
            ))}

            {/* Single data row — hours per day */}
            <div style={{ padding: "13px 14px", display: "flex", flexDirection: "column", gap: 2, borderBottom: "1px solid var(--kh-ink-50)", background: "var(--kh-bg)" }}>
              <span style={{ fontSize: 10, fontFamily: "var(--kh-font-mono)", color: "var(--kh-ink-400)", textTransform: "uppercase", letterSpacing: ".06em" }}>Open – Close</span>
            </div>
            {activeDays.map(day => {
              const s = schedule[day]!
              return (
                <div key={day} style={{ borderLeft: "1px solid var(--kh-ink-100)", borderBottom: "1px solid var(--kh-ink-50)", padding: "10px 14px" }}>
                  <div style={{ background: "linear-gradient(180deg,#FEF0E8,#FDE8DA)", borderLeft: "3px solid #D2592F", borderRadius: 6, padding: "8px 10px" }}>
                    <div style={{ fontFamily: "var(--kh-font-mono)", fontSize: 12, fontWeight: 700, color: "#7A2810" }}>{s.opens}</div>
                    <div style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11, color: "#B24420", marginTop: 2 }}>– {s.closes}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {editOpen && (
        <ScheduleEditModal
          classId={cls.id}
          initial={schedule}
          onClose={() => setEditOpen(false)}
          onSaved={setSchedule}
        />
      )}
    </div>
  )
}

function TabStrip({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  function updateArrows() {
    const el = scrollerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }

  useEffect(() => {
    updateArrows()
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener("scroll", updateArrows)
    window.addEventListener("resize", updateArrows)
    return () => {
      el.removeEventListener("scroll", updateArrows)
      window.removeEventListener("resize", updateArrows)
    }
  }, [])

  function scrollBy(amount: number) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" })
  }

  return (
    <div style={{ display: "flex", alignItems: "center", background: "var(--kh-surface)", borderBottom: "1px solid var(--kh-ink-100)" }}>
      <button
        className={`kh-tabs-nav-arrow${canScrollLeft ? " kh-tabs-nav-arrow--visible" : ""}`}
        onClick={() => scrollBy(-120)}
        disabled={!canScrollLeft}
        aria-label="Scroll tabs left"
        style={{ marginLeft: 6 }}
      >
        <ChevronLeft size={15} />
      </button>

      <div ref={scrollerRef} className="kh-tabs-scroll" style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", gap: 18,
          padding: "0 16px",
          minWidth: "max-content",
        }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              style={{
                padding: "12px 2px", fontSize: 13, border: "none", background: "transparent",
                color: active === tab ? "var(--kh-ink-900)" : "var(--kh-ink-500)",
                fontWeight: active === tab ? 600 : 500,
                borderBottom: active === tab ? "2px solid var(--kh-peach)" : "2px solid transparent",
                cursor: "pointer", marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <button
        className={`kh-tabs-nav-arrow${canScrollRight ? " kh-tabs-nav-arrow--visible" : ""}`}
        onClick={() => scrollBy(120)}
        disabled={!canScrollRight}
        aria-label="Scroll tabs right"
        style={{ marginRight: 6 }}
      >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}

// ── Main exported component ────────────────────────────────────

export default function ClassTabs({
  cls,
  roster,
  waitlist,
  classId,
}: {
  cls: ClassWithRelations
  roster: Kids[]
  waitlist: WaitlistEntry[]
  classId: string
}) {
  const [active, setActive] = useState<Tab>("Roster")

  return (
    <>
      {/* Tab strip — scrollable on mobile with nav arrows, pinned so it never scrolls out of view */}
      <TabStrip active={active} onChange={setActive} />

      {/* Tab body */}
      <div style={{ padding: "18px 16px 40px", overflowY: "auto" }}>

        {/* KPI strip — always visible, responsive */}
        <div className="kh-kpi-strip">
          {[
            { label: "Enrolled",    value: roster.length,                            sub: `of ${cls.capacity} capacity`, tip: undefined },
            { label: "Spots open",  value: Math.max(0, cls.capacity - roster.length), sub: "available now", tip: undefined },
            { label: "Waitlist",    value: waitlist.length,                           sub: "waiting", tip: undefined },
            { label: "Age group",   value: cls.average_year ?? "—",                  sub: "target age range", tip: "The age range this class is intended for, e.g. \"2–3 yr\" — set manually, not calculated from enrolled children." },
          ].map((k, i) => (
            <div key={i} className="kh-card" style={{ padding: "13px 16px" }}>
              <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em", display: "flex", alignItems: "center" }}>
                {k.label}
                {k.tip && <KhTooltip label={`What is ${k.label}?`}>{k.tip}</KhTooltip>}
              </div>
              <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 26, color: "var(--kh-ink-900)", marginTop: 5, lineHeight: 1.1 }}>{k.value}</div>
              <div style={{ fontSize: 11, color: "var(--kh-ink-400)", marginTop: 2 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Active tab content */}
        {active === "Roster" && (
          <div className="kh-roster-row">
            <RosterTab cls={cls} roster={roster} classId={classId} />
            <WaitlistTable classId={classId} initial={waitlist} />
            
            {/* Allergy card — shown on Roster tab only */}
            {active === "Roster" && (
              <div className="kh-card" style={{ borderColor: "var(--kh-pink-l)" }}>
                <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--kh-ink-100)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Heart size={14} style={{ color: "var(--kh-pink)" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Allergy &amp; medical</span>
                </div>
                <div style={{ padding: "12px 16px 14px", fontSize: 12.5, color: "var(--kh-ink-400)" }}>
                  Medical &amp; allergy records coming soon.
                </div>
              </div>
            )}
          </div>
        )}

        {active === "Schedule" && <ScheduleTab cls={cls} />}

        {active === "Attendance"  && <AttendanceTab classId={classId} />}
        {active === "Incidents"   && <IncidentsTab classId={classId} roster={roster} />}
        {active === "Curriculum"  && <CurriculumTab classId={classId} />}
        {active === "Checklist"   && <ChecklistTab classId={classId} />}
        {active === "Progress"    && <ProgressTab classId={classId} />}
        {active === "Hub"         && <HubTab classId={classId} />}
        {active === "Documents"   && <DocumentsTab classId={classId} title={cls.name} />}
      </div>
    </>
  )
}
