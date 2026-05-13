import React from "react"

const classes = [
  {
    name: "Sunbeam", age: "3–5 yr", color: "#E8866A", tag: null,
    location: "House 2 · Room A", schedule: "M–F · 8:00–17:30",
    enrolled: 14, cap: 16,
    lead: { id: "PR", name: "Priya Raghavan", color: "#E8866A" },
    assistant: { id: "DM", name: "Devon Maleki", color: "#6A9EC8" },
    waitlist: 3,
    kids: ["IX","TX","OX","EX","NX","AX","WX","KX"],
    extra: 6,
  },
  {
    name: "Meadow", age: "2–3 yr", color: "#6BA07C", tag: "At capacity",
    location: "House 1 · Room A", schedule: "M–F · 8:00–17:30",
    enrolled: 12, cap: 12,
    lead: { id: "MA", name: "Marcus Alemán", color: "#6BA07C" },
    assistant: { id: "OG", name: "Ottilie Green", color: "#D97F8C" },
    waitlist: 5,
    kids: ["IX","TX","OX","EX","NX","AX","WX","KX"],
    extra: 4,
  },
  {
    name: "Bluebird", age: "12–24 mo", color: "#C9AE4E", tag: null,
    location: "House 2 · Room B", schedule: "M–F · 8:30–17:00",
    enrolled: 8, cap: 10,
    lead: { id: "HS", name: "Hana Sato", color: "#C9AE4E" },
    assistant: null,
    waitlist: 2,
    kids: ["IX","TX","OX","EX","NX","AX","WX","KX"],
    extra: 0,
  },
  {
    name: "Treehouse", age: "5–6 yr · Pre-K", color: "#D97F8C", tag: null,
    location: "House 1 · Room B", schedule: "M–F · 8:00–15:30",
    enrolled: 9, cap: 14,
    lead: { id: "MA", name: "Marcus Alemán", color: "#6BA07C" },
    assistant: { id: "JR", name: "Joaquin Ribeiro", color: "#A07CB4" },
    waitlist: 8,
    kids: ["IX","TX","OX","EX","NX","AX","WX","KX"],
    extra: 1,
  },
  {
    name: "Saturday Studio", age: "3–6 yr", color: "#E8866A", tag: null,
    location: "Shared space", schedule: "Sat · 9:00–12:00",
    enrolled: 11, cap: 18,
    lead: { id: "OG", name: "Ottilie Green", color: "#D97F8C" },
    assistant: null,
    waitlist: 8,
    kids: ["IX","TX","OX","EX","NX","AX","WX","KX"],
    extra: 0,
  },
]

function ClassCard({ cls }: { cls: typeof classes[0] }) {
  const pct = Math.round((cls.enrolled / cls.cap) * 100)
  const isFull = cls.enrolled >= cls.cap

  return (
    <div className="kh-card" style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: cls.color, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: "var(--kh-ink-900)" }}>{cls.name}</span>
          <span style={{ fontSize: 12, color: "var(--kh-ink-400)" }}>{cls.age}</span>
          {cls.tag && (
            <span style={{ fontSize: 11, fontWeight: 500, color: "#B07A1A", background: "#FEF3E2", borderRadius: 99, padding: "2px 8px" }}>
              ● {cls.tag}
            </span>
          )}
        </div>
      </div>
      <div style={{ fontSize: 12, color: "var(--kh-ink-400)", marginBottom: 14, display: "flex", gap: 12 }}>
        <span>📍 {cls.location}</span>
        <span>🕐 {cls.schedule}</span>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--kh-ink-500)", marginBottom: 5 }}>
          <span>Enrolled</span>
          <span style={{ fontFamily: "var(--kh-font-mono)" }}>{cls.enrolled} / {cls.cap}</span>
        </div>
        <div className="kh-room-bar">
          <div className="kh-room-bar-fill" style={{ width: pct + "%", background: isFull ? cls.color : cls.color }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em", color: "var(--kh-ink-400)", marginBottom: 5 }}>Lead</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--kh-ink-700)" }}>
            <span className="kh-avatar" style={{ background: cls.lead.color + "22", color: cls.lead.color, width: 22, height: 22, fontSize: 9 }}>{cls.lead.id}</span>
            {cls.lead.name}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em", color: "var(--kh-ink-400)", marginBottom: 5 }}>Assistant</div>
          {cls.assistant ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--kh-ink-700)" }}>
              <span className="kh-avatar" style={{ background: cls.assistant.color + "22", color: cls.assistant.color, width: 22, height: 22, fontSize: 9 }}>{cls.assistant.id}</span>
              {cls.assistant.name}
            </div>
          ) : (
            <span style={{ fontSize: 12, color: "var(--kh-ink-400)" }}>Unstaffed</span>
          )}
        </div>
        <div>
          <div style={{ fontSize: 10, fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em", color: "var(--kh-ink-400)", marginBottom: 5 }}>Waitlist</div>
          <div style={{ fontSize: 12, color: "var(--kh-ink-600)" }}>{cls.waitlist} families</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {cls.kids.map((k, i) => (
          <span key={i} className="kh-avatar" style={{ background: cls.color + "22", color: cls.color, width: 22, height: 22, fontSize: 9, flexShrink: 0 }}>{k}</span>
        ))}
        {cls.extra > 0 && (
          <span style={{ fontSize: 11, color: "var(--kh-ink-400)", marginLeft: 4 }}>+{cls.extra} more</span>
        )}
      </div>
    </div>
  )
}

export default function ClassesPage() {
  return (
    <div className="kh-page">
      <header className="kh-topbar">
        <nav className="kh-breadcrumb">
          <span className="kh-breadcrumb-parent">Kinderhub</span>
          <span className="kh-breadcrumb-sep">/</span>
          <span className="kh-breadcrumb-current">Classes</span>
        </nav>
        <div className="kh-topbar-right">
          <button className="kh-btn">📅 Week view</button>
          <button className="kh-btn kh-btn--primary">+ New class</button>
        </div>
      </header>

      <div className="kh-content">
        <div style={{ marginBottom: 16 }}>
          <h1 className="kh-h1">Classes</h1>
          <p className="kh-sub">5 classrooms · 54 enrolled · 10 on waitlist</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {classes.map((cls) => (
            <ClassCard key={cls.name} cls={cls} />
          ))}
        </div>
      </div>
    </div>
  )
}
