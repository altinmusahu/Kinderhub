import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyToken, cookieName } from "@/lib/auth"

export default async function CalendarPage() {
  const store = await cookies()
  const token = store.get(cookieName())?.value ?? null
  if (!token) redirect("/login")
  const session = await verifyToken(token)
  if (!session) redirect("/login")

  const days = ["Mon 21", "Tue 22", "Wed 23", "Thu 24", "Fri 25", "Sat 26", "Sun 27"]
  const hours = ["8", "9", "10", "11", "12", "13", "14", "15", "16", "17"]

  const events = [
    { d: 0, s: 0,   e: 1.5, title: "Morning circle · Sunbeam",        sub: "Priya R.",          tone: "peach" },
    { d: 0, s: 1.5, e: 3,   title: "Outdoor — garden",                sub: "All rooms",          tone: "sage"  },
    { d: 0, s: 4.5, e: 6,   title: "Nap · Bluebird",                  sub: "Hana S.",            tone: "butter" },
    { d: 1, s: 0.5, e: 2,   title: "Parent drop-in · Yamazaki tour",  sub: "Nina K.",            tone: "peach", pinned: true },
    { d: 1, s: 2.5, e: 4,   title: "Music — Meadow",                  sub: "Ottilie G.",         tone: "pink"  },
    { d: 1, s: 6,   e: 7,   title: "Staff sync",                      sub: "Leads",              tone: "clay"  },
    { d: 2, s: 0,   e: 1.5, title: "Morning circle · Sunbeam",        sub: "Priya R.",           tone: "peach" },
    { d: 2, s: 2,   e: 3.5, title: "Story time · Treehouse",          sub: "Marcus A.",          tone: "pink"  },
    { d: 2, s: 4,   e: 6,   title: "Nap · Bluebird",                  sub: "Hana S.",            tone: "butter" },
    { d: 3, s: 0,   e: 1.5, title: "Morning circle · Sunbeam",        sub: "Priya R.",           tone: "peach", today: true },
    { d: 3, s: 1.5, e: 3,   title: "Outdoor — park walk",             sub: "Meadow · Sunbeam",  tone: "sage",  today: true },
    { d: 3, s: 3,   e: 4,   title: "Lunch · all rooms",               sub: "Kitchen: Jun",       tone: "butter", today: true },
    { d: 3, s: 4,   e: 6,   title: "Nap",                             sub: "Bluebird · Meadow",  tone: "butter", today: true },
    { d: 3, s: 6.5, e: 8,   title: "Open studio",                     sub: "Treehouse",          tone: "pink",  today: true },
    { d: 4, s: 0,   e: 1.5, title: "Morning circle · Sunbeam",        sub: "Priya R.",           tone: "peach" },
    { d: 4, s: 1.5, e: 3,   title: "Spring picnic prep",              sub: "All staff",          tone: "sage"  },
    { d: 4, s: 6,   e: 8,   title: "Parent-teacher · Castellanos",    sub: "Marcus A.",          tone: "clay"  },
    { d: 5, s: 1,   e: 4,   title: "Saturday Studio",                 sub: "Ottilie G.",         tone: "peach" },
    { d: 5, s: 2,   e: 5,   title: "Spring picnic · Dolores Park",    sub: "All families",       tone: "sage",  pinned: true },
  ]

  const legend = [
    { tone: "peach",  label: "Sunbeam" },
    { tone: "sage",   label: "Meadow / Outdoor" },
    { tone: "butter", label: "Bluebird / Care" },
    { tone: "pink",   label: "Treehouse / Studio" },
    { tone: "clay",   label: "Staff · Parents" },
  ]

  const TONE: Record<string, { bg: string; border: string; text: string; sub: string }> = {
    peach:  { bg: "#FEF0E8", border: "#E8866A", text: "#7A3318", sub: "#B8502A" },
    sage:   { bg: "#EAF3EC", border: "#6BA07C", text: "#2E5E3A", sub: "#4A7A5A" },
    butter: { bg: "#FEF7E0", border: "#C9AE4E", text: "#6B5A10", sub: "#8A7620" },
    pink:   { bg: "#FCEEF0", border: "#D97F8C", text: "#7A303A", sub: "#A85060" },
    clay:   { bg: "#FAEEE8", border: "#D2592F", text: "#7A2810", sub: "#B24420" },
  }

  const ROW_H = 54

  return (
    <div className="kh-page">
      <header className="kh-topbar">
        <nav className="kh-breadcrumb">
          <span className="kh-breadcrumb-parent">Kinderhub</span>
          <span className="kh-breadcrumb-sep">/</span>
          <span className="kh-breadcrumb-current">Calendar</span>
        </nav>
        <div className="kh-topbar-right">
          <button className="kh-btn">≡ Rooms</button>
          <button className="kh-btn">👤 Staff</button>
          <button className="kh-btn kh-btn--primary">+ New event</button>
        </div>
      </header>

      <div className="kh-content" style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Header strip */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <h1 className="kh-h1">April 2026</h1>
            <p className="kh-sub" style={{ margin: 0 }}>Week of Apr 21 – 27 · Mission campus</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* View toggle */}
            <div style={{ display: "flex", gap: 2, padding: 3, background: "var(--kh-ink-50)", border: "1px solid var(--kh-ink-100)", borderRadius: 10 }}>
              {["Day", "Week", "Month", "Agenda"].map((v, i) => (
                <div key={v} style={{
                  padding: "5px 12px", borderRadius: 7, fontSize: 12.5, cursor: "pointer",
                  background: i === 1 ? "var(--kh-surface)" : "transparent",
                  boxShadow: i === 1 ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  color: i === 1 ? "var(--kh-ink-900)" : "var(--kh-ink-500)",
                  fontWeight: i === 1 ? 600 : 500,
                }}>{v}</div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button className="kh-btn" style={{ padding: "6px 8px" }}>‹</button>
              <button className="kh-btn">Today</button>
              <button className="kh-btn" style={{ padding: "6px 8px" }}>›</button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "var(--kh-ink-500)" }}>
          {legend.map(x => (
            <span key={x.label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{
                width: 10, height: 10, borderRadius: 3, flexShrink: 0,
                background: TONE[x.tone].bg,
                border: `1px solid ${TONE[x.tone].border}`,
              }} />
              {x.label}
            </span>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="kh-card" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7, 1fr)", borderBottom: "1px solid var(--kh-border)", flexShrink: 0 }}>
            <div />
            {days.map((d, i) => {
              const isToday = i === 3
              return (
                <div key={d} style={{
                  padding: "12px 10px",
                  borderLeft: "1px solid var(--kh-border)",
                  background: isToday ? "#FEF0E8" : "transparent",
                }}>
                  <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>
                    {d.split(" ")[0]}
                  </div>
                  <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 20, color: isToday ? "#B24420" : "var(--kh-ink-900)", letterSpacing: "-.01em", marginTop: 2 }}>
                    {d.split(" ")[1]}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Time + events scroll area */}
          <div style={{ flex: 1, overflow: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7, 1fr)", position: "relative" }}>
              {/* Time column */}
              <div style={{ flexShrink: 0 }}>
                {hours.map(h => (
                  <div key={h} style={{
                    height: ROW_H, padding: "4px 8px",
                    borderBottom: "1px solid var(--kh-border-soft)",
                    fontSize: 10.5, fontFamily: "var(--kh-font-mono)",
                    color: "var(--kh-ink-400)", textAlign: "right",
                  }}>
                    {h}:00
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {days.map((_, dayIdx) => {
                const isToday = dayIdx === 3
                const dayEvents = events.filter(e => e.d === dayIdx)
                return (
                  <div key={dayIdx} style={{
                    position: "relative",
                    borderLeft: "1px solid var(--kh-border)",
                    background: isToday ? "linear-gradient(180deg, #FEF0E8 0%, transparent 12%)" : "transparent",
                  }}>
                    {/* Hour grid lines */}
                    {hours.map((_, hi) => (
                      <div key={hi} style={{ height: ROW_H, borderBottom: "1px solid var(--kh-border-soft)" }} />
                    ))}

                    {/* Now line */}
                    {isToday && (
                      <div style={{
                        position: "absolute", left: -4, right: 0,
                        top: ROW_H * (9 + 14 / 60 - 8),
                        height: 0, borderTop: "1.5px solid #D2592F", zIndex: 3,
                        pointerEvents: "none",
                      }}>
                        <span style={{
                          position: "absolute", left: -4, top: -5,
                          width: 10, height: 10, borderRadius: "50%",
                          background: "#D2592F",
                          boxShadow: "0 0 0 3px rgba(210,89,47,0.20)",
                        }} />
                      </div>
                    )}

                    {/* Events */}
                    {dayEvents.map((ev, ei) => {
                      const t = TONE[ev.tone] ?? TONE.peach
                      return (
                        <div key={ei} style={{
                          position: "absolute",
                          left: 5, right: 5,
                          top: ev.s * ROW_H,
                          height: (ev.e - ev.s) * ROW_H - 3,
                          background: `linear-gradient(180deg, ${t.bg}, color-mix(in oklch, ${t.bg} 70%, ${t.border}))`,
                          borderLeft: `3px solid ${t.border}`,
                          borderRadius: 6,
                          padding: "5px 7px",
                          overflow: "hidden",
                          cursor: "pointer",
                          boxShadow: (ev as any).pinned ? `0 2px 8px -2px ${t.border}55` : "none",
                          zIndex: 2,
                        }}>
                          <div style={{ fontSize: 11.5, fontWeight: 600, color: t.text, display: "flex", alignItems: "center", gap: 4, lineHeight: 1.3 }}>
                            {(ev as any).pinned && <span style={{ fontSize: 9 }}>★</span>}
                            {ev.title}
                          </div>
                          <div style={{ fontSize: 10.5, color: t.sub, marginTop: 1 }}>{ev.sub}</div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
