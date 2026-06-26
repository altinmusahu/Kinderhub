"use client"

import { useState } from "react"
import type { ClassWithRelations } from "@/app/api/modules/classes/classes.types"
import type { Kids } from "@/app/api/modules/kids/kids.types"
import type { WaitlistEntry } from "@/app/api/modules/waitlist/waitlist.types"
import AddChildButton from "./AddChildButton"
import WaitlistTable from "./WaitlistTable"
import { Heart, MapPin, Clock, User } from "lucide-react"

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

const TABS = ["Roster", "Schedule", "Attendance", "Curriculum", "Documents"] as const
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

function ScheduleTab({ cls }: { cls: ClassWithRelations }) {
  const schedule = cls.schedule as Record<string, unknown> | null

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }}>

      {/* Daily hours */}
      <div className="kh-card">
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--kh-ink-100)" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Daily hours</span>
        </div>
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Start time", icon: <Clock size={13} />, value: cls.starts_at ? formatTime(cls.starts_at) : "—" },
            { label: "End time",   icon: <Clock size={13} />, value: cls.ends_at   ? formatTime(cls.ends_at)   : "—" },
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
      </div>

      {/* Weekly schedule from DB */}
      <div className="kh-card">
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--kh-ink-100)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Weekly schedule</span>
          {!schedule && (
            <span style={{ fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>no schedule data yet</span>
          )}
        </div>

        {!schedule || Object.keys(schedule).length === 0 ? (
          <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>
            No weekly schedule has been set for this class.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr>
                {["Day", "Details"].map((h) => (
                  <th key={h} style={{
                    textAlign: "left", fontWeight: 500, color: "var(--kh-ink-400)",
                    fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em",
                    padding: "10px 16px", borderBottom: "1px solid var(--kh-ink-100)",
                    fontFamily: "var(--kh-font-mono)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(schedule).map(([day, value], i) => (
                <tr key={day} style={{ borderTop: i === 0 ? "none" : "1px solid var(--kh-ink-50)" }}>
                  <td style={{ padding: "11px 16px", verticalAlign: "middle", width: 140 }}>
                    <span style={{ fontWeight: 600, color: "var(--kh-ink-800)" }}>{day}</span>
                  </td>
                  <td style={{ padding: "11px 16px", verticalAlign: "middle", color: "var(--kh-ink-600)" }}>
                    {typeof value === "object" && value !== null ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                          <span key={k} style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "2px 8px", borderRadius: 999,
                            background: "var(--kh-peach-bg)", color: "var(--kh-peach-d)",
                            fontSize: 11.5, fontWeight: 500,
                          }}>
                            <span style={{ color: "var(--kh-ink-400)" }}>{k}:</span> {String(v)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span>{String(value)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function ComingSoonTab({ label }: { label: string }) {
  return (
    <div className="kh-card" style={{ padding: "40px 24px", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 20, color: "var(--kh-ink-700)", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: "var(--kh-ink-400)" }}>
        This section is coming soon.
      </div>
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
      {/* Tab strip */}
      <div style={{
        display: "flex", gap: 18,
        borderBottom: "1px solid var(--kh-ink-100)",
        padding: "0 26px",
        background: "var(--kh-surface)",
      }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
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

      {/* Tab body */}
      <div style={{ padding: "18px 26px 40px", overflowY: "auto" }}>

        {/* KPI strip — always visible */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 18 }}>
          {[
            { label: "Enrolled",    value: roster.length,                            sub: `of ${cls.capacity} capacity` },
            { label: "Spots open",  value: Math.max(0, cls.capacity - roster.length), sub: "available now" },
            { label: "Waitlist",    value: waitlist.length,                           sub: "waiting" },
            { label: "Age group",   value: cls.average_year ?? "—",                  sub: "average year" },
          ].map((k, i) => (
            <div key={i} className="kh-card" style={{ padding: "13px 16px" }}>
              <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>{k.label}</div>
              <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 26, color: "var(--kh-ink-900)", marginTop: 5, lineHeight: 1.1 }}>{k.value}</div>
              <div style={{ fontSize: 11, color: "var(--kh-ink-400)", marginTop: 2 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Active tab content */}
        {active === "Roster" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <RosterTab cls={cls} roster={roster} classId={classId} />
            <WaitlistTable classId={classId} initial={waitlist} />
          </div>
        )}

        {active === "Schedule" && <ScheduleTab cls={cls} />}

        {active === "Attendance"  && <ComingSoonTab label="Attendance" />}
        {active === "Curriculum"  && <ComingSoonTab label="Curriculum" />}
        {active === "Documents"   && <ComingSoonTab label="Documents" />}

        {/* Allergy card — shown on Roster tab only */}
        {active === "Roster" && (
          <div className="kh-card" style={{ borderColor: "var(--kh-pink-l)", marginTop: 14 }}>
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
    </>
  )
}
