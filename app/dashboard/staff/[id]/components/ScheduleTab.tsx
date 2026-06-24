"use client"

import { useState } from "react"
import type { ClassRow } from "./types"

function fmt(t: string) {
  return t ? t.slice(0, 5) : "—"
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"]

export function ScheduleTab({ userId }: { userId: string }) {
  const [classes, setClasses] = useState<ClassRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function load() {
    if (loaded) return
    setLoading(true)
    const res = await fetch(`/api/users/${userId}/classes`)
    const data = await res.json()
    setClasses(Array.isArray(data) ? data : [])
    setLoading(false)
    setLoaded(true)
  }

  if (!loaded && !loading) { load() }

  if (loading || !loaded) {
    return <div style={{ padding: 32, textAlign: "center", color: "var(--kh-ink-400)", fontSize: 13 }}>Loading schedule…</div>
  }

  if (!classes || classes.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 24, color: "var(--kh-ink-900)", marginBottom: 8 }}>No classes assigned</div>
        <div style={{ fontSize: 13, color: "var(--kh-ink-400)" }}>This employee is not assigned to any class as lead or assistant.</div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "20px 28px 40px" }}>
      <div>
        <h2 style={{ fontFamily: "var(--kh-font-serif)", fontSize: 22, margin: 0 }}>Weekly Schedule</h2>
        <p style={{ fontSize: 13, color: "var(--kh-ink-400)", margin: "4px 0 0" }}>Classes run Mon–Fri unless otherwise noted</p>
      </div>

      <div className="kh-card" style={{ overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: `80px repeat(${DAYS.length}, 1fr)`, borderBottom: "1px solid var(--kh-border)" }}>
          <div style={{ padding: "10px 12px", fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>TIME</div>
          {DAYS.map(d => (
            <div key={d} style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "var(--kh-ink-700)", borderLeft: "1px solid var(--kh-border)" }}>{d}</div>
          ))}
        </div>
        {classes.map(cls => (
          <div key={cls.id} style={{ display: "grid", gridTemplateColumns: `80px repeat(${DAYS.length}, 1fr)`, borderBottom: "1px solid var(--kh-border-soft)" }}>
            <div style={{ padding: "12px", borderRight: "1px solid var(--kh-border)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 11, fontFamily: "var(--kh-font-mono)", color: "var(--kh-ink-500)" }}>{fmt(cls.starts_at)}</div>
              <div style={{ fontSize: 10, fontFamily: "var(--kh-font-mono)", color: "var(--kh-ink-300)" }}>{fmt(cls.ends_at)}</div>
            </div>
            {DAYS.map(d => (
              <div key={d} style={{ borderLeft: "1px solid var(--kh-border-soft)", padding: "10px 12px" }}>
                <div style={{ background: "linear-gradient(180deg,#FEF0E8,#FDE8DA)", borderLeft: "3px solid #D2592F", borderRadius: 6, padding: "8px 10px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#7A2810" }}>{cls.name}</div>
                  <div style={{ fontSize: 11, color: "#B24420", marginTop: 2 }}>Age {cls.average_year}</div>
                  {cls.locations && <div style={{ fontSize: 10.5, color: "#B24420", marginTop: 2, opacity: 0.8 }}>{cls.locations.name}</div>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {classes.map(cls => (
          <div key={cls.id} className="kh-card" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: "#D2592F", flexShrink: 0 }} />
              <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--kh-ink-900)" }}>{cls.name}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "var(--kh-ink-400)" }}>Age group</span>
                <span style={{ color: "var(--kh-ink-700)" }}>{cls.average_year}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "var(--kh-ink-400)" }}>Time</span>
                <span style={{ color: "var(--kh-ink-700)", fontFamily: "var(--kh-font-mono)", fontSize: 11.5 }}>{fmt(cls.starts_at)} – {fmt(cls.ends_at)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "var(--kh-ink-400)" }}>Capacity</span>
                <span style={{ color: "var(--kh-ink-700)" }}>{cls.capacity} children</span>
              </div>
              {cls.locations && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--kh-ink-400)" }}>Location</span>
                  <span style={{ color: "var(--kh-ink-700)" }}>{cls.locations.name}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
