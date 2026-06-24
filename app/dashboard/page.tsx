import React from "react"

// ─── Data ──────────────────────────────────────────────────────────────────

const stats = [
  { label: "Active families", value: "98",    delta: "+3",       deltaColor: "sage"   },
  { label: "Kids present",    value: "112",   sub: "/ 124 enrolled"                   },
  { label: "Staff on shift",  value: "14",    sub: "/ 18 today"                       },
  { label: "Overdue balances",value: "$1,560",delta: "2 families",deltaColor: "pink"  },
]

const rooms = [
  { name: "Sunbeam",   age: "3–5y",    pres: 13, cap: 16, color: "#E8866A", lead: "PR", leadName: "Priya R."  },
  { name: "Meadow",    age: "2–3y",    pres: 11, cap: 12, color: "#6BA07C", lead: "MA", leadName: "Marcus A." },
  { name: "Bluebird",  age: "12–24m",  pres: 7,  cap: 10, color: "#C9AE4E", lead: "HS", leadName: "Hana S."   },
  { name: "Treehouse", age: "Pre-K",   pres: 9,  cap: 14, color: "#D97F8C", lead: "MA", leadName: "Marcus A." },
]

const attention = [
  { icon: "💳", tone: "pink",   title: "2 invoices overdue",        sub: "Castellanos · Volkov"    },
  { icon: "🩺", tone: "butter", title: "CPR expiring — Hana Sato",  sub: "Renew by May 8"          },
  { icon: "📅", tone: "peach",  title: "Tour scheduled — Yamazaki", sub: "Sat May 3, 10:30 AM"     },
]

const activity = [
  { t: "9:14", text: "Mateo Castellanos checked in",    sub: "Meadow · by Diana",  color: "#6BA07C" },
  { t: "9:12", text: "Invoice INV-2050 marked overdue", sub: "Castellanos · $1,120.00", color: "#D97F8C" },
  { t: "9:02", text: "Ines Okafor-Lind checked in",     sub: "Sunbeam · by Amara", color: "#E8866A" },
  { t: "8:57", text: "Teo Okafor-Lind checked in",      sub: "Bluebird · by Amara",color: "#C9AE4E" },
  { t: "8:49", text: "Nika Volkov checked in",          sub: "Sunbeam · by Irina", color: "#E8866A" },
  { t: "8:42", text: "Hana Sato clocked in",            sub: "Bluebird lead",      color: "#C9AE4E" },
  { t: "8:30", text: "Priya Raghavan clocked in",       sub: "Sunbeam lead",       color: "#E8866A" },
]

const barsData = [32,68,96,108,112,108,104,92,64,22]
const barMax   = 112

// ─── Helpers ───────────────────────────────────────────────────────────────

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <span className="kh-avatar" style={{ background: color + "22", color }}>
      {initials}
    </span>
  )
}

function Pill({ children, color, dot }: { children: React.ReactNode; color: string; dot?: boolean }) {
  return (
    <span className="kh-pill" style={{ background: color + "18", color }}>
      {dot && <span className="kh-pill-dot" style={{ background: color }} />}
      {children}
    </span>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="kh-page">
      {/* Topbar */}
      <header className="kh-topbar">
        <nav className="kh-breadcrumb">
          <span className="kh-breadcrumb-parent">Kinderhub</span>
          <span className="kh-breadcrumb-sep">/</span>
          <span className="kh-breadcrumb-current">Overview</span>
        </nav>
        <div className="kh-topbar-right">
          <span className="kh-topbar-date">Today · Thu, Apr 24</span>
          <button className="kh-btn">+ New</button>
          <button className="kh-btn kh-btn--primary">✦ Daily brief</button>
        </div>
      </header>

      {/* Content */}
      <div className="kh-content">
        {/* Heading */}
        <div className="kh-heading-row">
          <div>
            <h1 className="kh-h1">Good morning, Nina.</h1>
            <p className="kh-sub">Everything's on track. 3 items need your eye today.</p>
          </div>
          <div className="kh-pills-row">
            <Pill color="#4CAF50" dot>All ratios met</Pill>
            <Pill color="#F0A04B" dot>3 needs attention</Pill>
          </div>
        </div>

        {/* Stat cards */}
        <div className="kh-stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="kh-card kh-stat-card">
              <div className="kh-stat-label">{s.label}</div>
              <div className="kh-stat-value-row">
                <span className="kh-stat-value">{s.value}</span>
                {s.sub && <span className="kh-stat-sub">{s.sub}</span>}
              </div>
              {s.delta && (
                <div style={{ marginTop: 8 }}>
                  <Pill color={s.deltaColor === "pink" ? "#D97F8C" : "#6BA07C"}>{s.delta}</Pill>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rooms + Attention */}
        <div className="kh-two-col" style={{ gridTemplateColumns: "1.45fr 1fr" }}>
          {/* Rooms */}
          <div className="kh-card">
            <div className="kh-card-header">
              <span className="kh-card-title">Rooms today</span>
              <span className="kh-card-meta">8:00 — 17:30</span>
            </div>
            <div className="kh-rooms-list">
              {rooms.map(r => {
                const pct = Math.round((r.pres / r.cap) * 100)
                return (
                  <div key={r.name} className="kh-room-row">
                    <div className="kh-room-name">
                      <span className="kh-room-dot" style={{ background: r.color }} />
                      <div>
                        <div className="kh-room-label">{r.name}</div>
                        <div className="kh-room-age">{r.age}</div>
                      </div>
                    </div>
                    <div className="kh-room-bar-wrap">
                      <div className="kh-room-bar">
                        <div className="kh-room-bar-fill" style={{ width: pct + "%", background: r.color }} />
                      </div>
                    </div>
                    <div className="kh-room-count">{r.pres} / {r.cap}</div>
                    <div className="kh-room-lead">
                      <Avatar initials={r.lead} color={r.color} />
                      {r.leadName}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Needs attention */}
          <div className="kh-card">
            <div className="kh-card-header">
              <span className="kh-card-title">Needs attention</span>
              <span className="kh-card-meta kh-meta-badge">3</span>
            </div>
            <div className="kh-attention-list">
              {attention.map((n, i) => (
                <div key={i} className="kh-attention-row">
                  <span className="kh-attention-icon">{n.icon}</span>
                  <div className="kh-attention-body">
                    <div className="kh-attention-title">{n.title}</div>
                    <div className="kh-attention-sub">{n.sub}</div>
                  </div>
                  <span className="kh-attention-chev">›</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity + Chart */}
        <div className="kh-two-col">
          {/* Live activity */}
          <div className="kh-card">
            <div className="kh-card-header">
              <span className="kh-card-title">Live activity</span>
              <span className="kh-card-meta">today</span>
            </div>
            <div className="kh-activity-list">
              {activity.map((a, i) => (
                <div key={i} className="kh-activity-row">
                  <span className="kh-activity-time">{a.t}</span>
                  <span className="kh-activity-dot" style={{ background: a.color }} />
                  <div className="kh-activity-body">
                    <div className="kh-activity-text">{a.text}</div>
                    <div className="kh-activity-sub">{a.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance curve */}
          <div className="kh-card">
            <div className="kh-card-header">
              <span className="kh-card-title">Attendance curve</span>
              <span className="kh-card-meta">Mon — Fri avg</span>
            </div>
            <div className="kh-chart-wrap">
              <div className="kh-chart-bars">
                {barsData.map((v, i) => (
                  <div key={i} className="kh-chart-col">
                    <div
                      className="kh-chart-bar"
                      style={{ height: `${Math.round((v / barMax) * 100)}%` }}
                    />
                    <div className="kh-chart-label">{7 + i}</div>
                  </div>
                ))}
              </div>
              <div className="kh-chart-footer">
                <span><b>112</b> peak</span>
                <span><b>11:00</b> busiest</span>
                <span><b>0.94</b> ratio avg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
