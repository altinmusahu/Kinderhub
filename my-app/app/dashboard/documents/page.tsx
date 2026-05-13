import React from "react"

const documents = [
  { id: 1, name: "Immunization record · Ines",      family: "Okafor-Lind",   fid: "OL", color: "#E8866A", type: "Health",    status: "Signed",       date: "Mar 15, 2024", size: "1.2 MB" },
  { id: 2, name: "EpiPen action plan · Ines",       family: "Okafor-Lind",   fid: "OL", color: "#E8866A", type: "Health",    status: "Signed",       date: "Mar 15, 2024", size: "420 KB" },
  { id: 3, name: "Photo release · both",            family: "Okafor-Lind",   fid: "OL", color: "#E8866A", type: "Consent",   status: "Signed",       date: "Sep 5, 2023",  size: "180 KB" },
  { id: 4, name: "Pickup authorization",            family: "Okafor-Lind",   fid: "OL", color: "#E8866A", type: "Consent",   status: "Needs update", date: "Sep 5, 2023",  size: "95 KB"  },
  { id: 5, name: "Enrollment agreement",            family: "Castellanos",   fid: "DC", color: "#D97F8C", type: "Enrollment", status: "Signed",       date: "Jan 8, 2024",  size: "340 KB" },
  { id: 6, name: "Immunization record · Mateo",    family: "Castellanos",   fid: "DC", color: "#D97F8C", type: "Health",    status: "Signed",       date: "Jan 8, 2024",  size: "980 KB" },
  { id: 7, name: "Photo release",                  family: "Castellanos",   fid: "DC", color: "#D97F8C", type: "Consent",   status: "Needs update", date: "Jan 8, 2024",  size: "180 KB" },
  { id: 8, name: "Enrollment agreement",           family: "Benitez-Ahmed", fid: "LA", color: "#6BA07C", type: "Enrollment", status: "Signed",       date: "Aug 12, 2022", size: "340 KB" },
  { id: 9, name: "CPR certification · Hana Sato",  family: "Staff",         fid: "HS", color: "#C9AE4E", type: "Staff",     status: "Expiring",     date: "May 8, 2024",  size: "660 KB" },
  { id: 10,name: "Employment contract · Devon",    family: "Staff",         fid: "DM", color: "#6A9EC8", type: "Staff",     status: "Signed",       date: "Jan 12, 2023", size: "210 KB" },
  { id: 11,name: "Field trip waiver · Meadow",     family: "All families",  fid: "ALL",color: "#6BA07C", type: "Consent",   status: "Pending",      date: "Apr 28, 2024", size: "140 KB" },
  { id: 12,name: "Spring picnic permission",       family: "All families",  fid: "ALL",color: "#6BA07C", type: "Consent",   status: "Pending",      date: "Apr 20, 2024", size: "95 KB"  },
]

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Signed:       { bg: "#E8F5EC", color: "#3A8C50" },
  "Needs update":{ bg: "#FEF3E2", color: "#B07A1A" },
  Expiring:     { bg: "#FDEAEA", color: "#C0392B" },
  Pending:      { bg: "#F0EDE8", color: "#7A7368" },
}

const TYPE_COLORS: Record<string, string> = {
  Health:     "#D97F8C",
  Consent:    "#E8866A",
  Enrollment: "#6BA07C",
  Staff:      "#C9AE4E",
}

const stats = [
  { label: "Total documents", value: "89" },
  { label: "Signed",          value: "74", color: "#3A8C50" },
  { label: "Needs attention", value: "8",  color: "#C0392B" },
  { label: "Pending",         value: "7",  color: "#B07A1A" },
]

export default function DocumentsPage() {
  return (
    <div className="kh-page">
      <header className="kh-topbar">
        <nav className="kh-breadcrumb">
          <span className="kh-breadcrumb-parent">Kinderhub</span>
          <span className="kh-breadcrumb-sep">/</span>
          <span className="kh-breadcrumb-current">Documents</span>
        </nav>
        <div className="kh-topbar-right">
          <button className="kh-btn">↑ Export</button>
          <button className="kh-btn kh-btn--primary">+ Upload document</button>
        </div>
      </header>

      <div className="kh-content">
        <div style={{ marginBottom: 14 }}>
          <h1 className="kh-h1">Documents</h1>
          <p className="kh-sub">89 documents · 74 signed · 8 need attention</p>
        </div>

        {/* Stats */}
        <div className="kh-stats-grid" style={{ marginBottom: 4 }}>
          {stats.map((s, i) => (
            <div key={i} className="kh-card kh-stat-card">
              <div className="kh-stat-label">{s.label}</div>
              <div className="kh-stat-value-row" style={{ marginTop: 8 }}>
                <span className="kh-stat-value" style={{ color: s.color ?? "var(--kh-ink-900)" }}>{s.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="kh-tabs">
          {["All", "Health", "Consent", "Enrollment", "Staff"].map((t, i) => (
            <button key={t} className={`kh-tab ${i === 0 ? "kh-tab--active" : ""}`}>{t}</button>
          ))}
          <div style={{ flex: 1 }} />
          <div className="kh-search-inline">
            <span style={{ fontSize: 12, opacity: .5 }}>🔍</span>
            <span style={{ fontSize: 12, color: "var(--kh-ink-400)" }}>Search documents...</span>
          </div>
        </div>

        {/* Table */}
        <div className="kh-card" style={{ overflow: "hidden" }}>
          <table className="kh-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Family / Staff</th>
                <th>Status</th>
                <th>Date</th>
                <th>Size</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => {
                const ss = STATUS_STYLE[d.status] ?? STATUS_STYLE.Pending
                const tc = TYPE_COLORS[d.type] ?? "var(--kh-ink-400)"
                return (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 16 }}>📄</span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--kh-ink-800)" }}>{d.name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 500, color: tc, background: tc + "18", borderRadius: 99, padding: "2px 8px" }}>{d.type}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="kh-avatar" style={{ background: d.color + "22", color: d.color, width: 22, height: 22, fontSize: 9 }}>{d.fid}</span>
                        <span style={{ fontSize: 12, color: "var(--kh-ink-600)" }}>{d.family}</span>
                      </div>
                    </td>
                    <td>
                      <span className="kh-status-badge" style={{ background: ss.bg, color: ss.color }}>
                        <span className="kh-pill-dot" style={{ background: ss.color }} />
                        {d.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>{d.date}</td>
                    <td style={{ fontSize: 12, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>{d.size}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="kh-btn" style={{ padding: "3px 8px", fontSize: 11 }}>View</button>
                        <button className="kh-btn" style={{ padding: "3px 8px", fontSize: 11 }}>↓</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
