import React from "react"
import { DataTable, Column } from "@/app/components/dashboard/DataTable"

const staff = [
  { id: "PR", name: "Priya Raghavan",  role: "Lead Teacher",    dept: "Classroom & Care",        room: "Sunbeam",          status: "Active",   shift: "8:00–17:30", color: "#E8866A" },
  { id: "MA", name: "Marcus Alemán",   role: "Lead Teacher",    dept: "Education & Curriculum",  room: "Meadow · Treehouse",status: "Active",   shift: "8:00–17:30", color: "#6BA07C" },
  { id: "HS", name: "Hana Sato",       role: "Lead Teacher",    dept: "Classroom & Care",        room: "Bluebird",         status: "Active",   shift: "8:30–17:00", color: "#C9AE4E" },
  { id: "OG", name: "Ottilie Green",   role: "Lead Teacher",    dept: "Education & Curriculum",  room: "Saturday Studio",  status: "Active",   shift: "9:00–12:00", color: "#D97F8C" },
  { id: "DM", name: "Devon Maleki",    role: "Assistant",       dept: "Classroom & Care",        room: "Sunbeam",          status: "Active",   shift: "8:00–17:00", color: "#6A9EC8" },
  { id: "JR", name: "Joaquin Ribeiro", role: "Assistant",       dept: "Classroom & Care",        room: "Treehouse",        status: "Active",   shift: "8:00–15:30", color: "#A07CB4" },
  { id: "NK", name: "Nina Kowalski",   role: "Director",        dept: "Administration",          room: "—",                status: "Active",   shift: "8:00–18:00", color: "#7CA0B4" },
  { id: "RB", name: "Rowan Baird",     role: "Admin Assistant", dept: "Administration",          room: "—",                status: "Active",   shift: "9:00–17:00", color: "#B4A07C" },
  { id: "JP", name: "Jun Park",        role: "Kitchen Lead",    dept: "Kitchen & Facilities",    room: "Kitchen",          status: "Active",   shift: "7:30–14:00", color: "#7CB49A" },
  { id: "EL", name: "Eliot (ext.)",    role: "Finance",         dept: "Finance & Billing",       room: "—",                status: "External", shift: "—",          color: "#C4B49A" },
]

type StaffMember = typeof staff[0]

const depts = [
  { name: "Administration",         color: "#E8866A", count: 3 },
  { name: "Classroom & Care",       color: "#D97F8C", count: 9 },
  { name: "Education & Curriculum", color: "#6BA07C", count: 4 },
  { name: "Family Relations",       color: "#E8866A", count: 2 },
  { name: "Finance & Billing",      color: "#C9AE4E", count: 1 },
  { name: "Kitchen & Facilities",   color: "#6BA07C", count: 3 },
]

const columns: Column<StaffMember>[] = [
  {
    key: "member",
    header: "Member",
    cell: (s) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="kh-avatar" style={{ background: s.color + "22", color: s.color }}>{s.id}</span>
        <span style={{ fontWeight: 600, fontSize: 13, color: "var(--kh-ink-900)" }}>{s.name}</span>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    cellStyle: { fontSize: 13, color: "var(--kh-ink-600)" },
    cell: (s) => s.role,
  },
  {
    key: "dept",
    header: "Department",
    cellStyle: { fontSize: 13, color: "var(--kh-ink-500)" },
    cell: (s) => s.dept,
  },
  {
    key: "room",
    header: "Room",
    cellStyle: { fontSize: 13, color: "var(--kh-ink-500)" },
    cell: (s) => s.room,
  },
  {
    key: "status",
    header: "Status",
    cell: (s) => (
      <span className="kh-status-badge" style={{
        background: s.status === "Active" ? "#E8F5EC" : "#F0EDE8",
        color:      s.status === "Active" ? "#3A8C50" : "#7A7368",
      }}>
        <span className="kh-pill-dot" style={{ background: s.status === "Active" ? "#3A8C50" : "#9E968A" }} />
        {s.status}
      </span>
    ),
  },
  {
    key: "shift",
    header: "Shift",
    cellStyle: { fontSize: 12, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" },
    cell: (s) => s.shift,
  },
]

export default function StaffPage() {
  return (
    <div className="kh-page">
      <header className="kh-topbar">
        <nav className="kh-breadcrumb">
          <span className="kh-breadcrumb-parent">Kinderhub</span>
          <span className="kh-breadcrumb-sep">/</span>
          <span className="kh-breadcrumb-current">Staff</span>
        </nav>
        <div className="kh-topbar-right">
          <button className="kh-btn">≡ Filter</button>
          <button className="kh-btn kh-btn--primary">+ Add staff</button>
        </div>
      </header>

      <div className="kh-content">
        <div style={{ marginBottom: 6 }}>
          <h1 className="kh-h1">Staff</h1>
          <p className="kh-sub">18 members · 6 departments · 2 invites pending</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 4 }}>
          {depts.map((d) => (
            <div key={d.name} className="kh-card" style={{ padding: "14px 16px", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>{d.name}</div>
                <span style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11, color: "var(--kh-ink-400)" }}>{d.count}</span>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: -4 }}>
                {Array.from({ length: Math.min(d.count, 5) }).map((_, i) => (
                  <span key={i} className="kh-avatar" style={{ background: d.color + "22", color: d.color, fontSize: 9, width: 22, height: 22, marginLeft: i > 0 ? -6 : 0, border: "2px solid #fff" }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DataTable
          columns={columns}
          rows={staff}
          getRowKey={(s) => s.id}
          title="All staff"
          meta="18 members"
        />
      </div>
    </div>
  )
}
