import React from "react"
import { DataTable, Column } from "@/app/components/dashboard/DataTable"

const families = [
  { id: "AO",  name: "Okafor-Lind",   parent: "Amara Okafor",      status: "Active",   plan: "Full-time",       kids: 2, room: "Sunbeam · Bluebird",  balance: "$0.00",    since: "Sep 2023", balanceRed: false, checked: true  },
  { id: "DC",  name: "Castellanos",   parent: "Diana Castellanos",  status: "Active",   plan: "Part-time · MWF", kids: 1, room: "Meadow",              balance: "$1120.00", since: "Jan 2024", balanceRed: true,  checked: false },
  { id: "RY",  name: "Yamazaki",      parent: "Rin Yamazaki",       status: "Waitlist", plan: "Full-time",       kids: 1, room: "—",                   balance: "$0.00",    since: "—",        balanceRed: false, checked: false },
  { id: "LA",  name: "Benitez-Ahmed", parent: "Laila Ahmed",        status: "Active",   plan: "Full-time",       kids: 1, room: "Bluebird",            balance: "$0.00",    since: "Aug 2022", balanceRed: false, checked: false },
  { id: "HP",  name: "Park",          parent: "Hannah Park",        status: "Active",   plan: "Part-time · TTh", kids: 1, room: "Meadow",              balance: "$0.00",    since: "Mar 2024", balanceRed: false, checked: false },
  { id: "IV",  name: "Volkov",        parent: "Irina Volkov",       status: "Active",   plan: "Full-time",       kids: 1, room: "Sunbeam",             balance: "$448.00",  since: "Oct 2023", balanceRed: true,  checked: false },
  { id: "FO",  name: "Oduya",         parent: "Femi Oduya",         status: "Active",   plan: "Full-time",       kids: 2, room: "Meadow · Treehouse",  balance: "$0.00",    since: "Sep 2023", balanceRed: false, checked: false },
  { id: "VC",  name: "Chen-Murphy",   parent: "Vivian Chen",        status: "Paused",   plan: "Full-time",       kids: 1, room: "—",                   balance: "$0.00",    since: "Feb 2023", balanceRed: false, checked: false },
  { id: "YH",  name: "Habibi",        parent: "Yasmin Habibi",      status: "Waitlist", plan: "Part-time",       kids: 1, room: "—",                   balance: "$0.00",    since: "—",        balanceRed: false, checked: false },
  { id: "EB",  name: "Brunner",       parent: "Eliot Brunner",      status: "Active",   plan: "Full-time",       kids: 1, room: "Sunbeam",             balance: "$0.00",    since: "Jan 2024", balanceRed: false, checked: false },
  { id: "AO2", name: "Osei",          parent: "Akosua Osei",        status: "Active",   plan: "Part-time · MWF", kids: 1, room: "Meadow",              balance: "$0.00",    since: "Nov 2023", balanceRed: false, checked: false },
]

type Family = typeof families[0]

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Active:   { bg: "#E8F5EC", color: "#3A8C50" },
  Waitlist: { bg: "#FEF3E2", color: "#B07A1A" },
  Paused:   { bg: "#F0EDE8", color: "#7A7368" },
}

const AVATAR_COLORS = ["#E8866A","#6BA07C","#C9AE4E","#D97F8C","#6A9EC8","#A07CB4","#7CA0B4"]

function avatarColor(id: string) {
  let n = 0; for (const c of id) n += c.charCodeAt(0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

const columns: Column<Family>[] = [
  {
    key: "checkbox",
    header: "",
    headerStyle: { width: 36 },
    cell: (f) => <input type="checkbox" className="kh-checkbox" defaultChecked={f.checked} />,
  },
  {
    key: "family",
    header: "Family",
    cell: (f) => {
      const ac = avatarColor(f.id)
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="kh-avatar" style={{ background: ac + "22", color: ac, fontSize: 10 }}>
            {f.id.replace(/\d/g, "")}
          </span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--kh-ink-900)" }}>{f.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)" }}>{f.parent}</div>
          </div>
        </div>
      )
    },
  },
  {
    key: "status",
    header: "Status",
    cell: (f) => {
      const sc = STATUS_COLORS[f.status] ?? STATUS_COLORS.Active
      return (
        <span className="kh-status-badge" style={{ background: sc.bg, color: sc.color }}>
          <span className="kh-pill-dot" style={{ background: sc.color }} />
          {f.status}
        </span>
      )
    },
  },
  {
    key: "plan",
    header: "Plan",
    cellStyle: { fontSize: 13, color: "var(--kh-ink-600)" },
    cell: (f) => f.plan,
  },
  {
    key: "kids",
    header: "Kids",
    cellStyle: { fontSize: 13, color: "var(--kh-ink-700)", fontFamily: "var(--kh-font-mono)" },
    cell: (f) => f.kids,
  },
  {
    key: "room",
    header: "Room",
    cellStyle: { fontSize: 13, color: "var(--kh-ink-500)" },
    cell: (f) => f.room,
  },
  {
    key: "balance",
    header: "Balance",
    headerStyle: { textAlign: "right" },
    cellStyle: (f) => ({
      textAlign: "right",
      fontFamily: "var(--kh-font-mono)",
      fontSize: 13,
      color: f.balanceRed ? "#C0392B" : "var(--kh-ink-700)",
      fontWeight: f.balanceRed ? 600 : 400,
    }),
    cell: (f) => f.balance,
  },
  {
    key: "since",
    header: "Since",
    cellStyle: { fontSize: 12, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" },
    cell: (f) => f.since,
  },
]

export default function FamiliesPage() {
  return (
    <div className="kh-page">
      <header className="kh-topbar">
        <nav className="kh-breadcrumb">
          <span className="kh-breadcrumb-parent">Kinderhub</span>
          <span className="kh-breadcrumb-sep">/</span>
          <span className="kh-breadcrumb-current">Families</span>
        </nav>
        <div className="kh-topbar-right">
          <button className="kh-btn">≡ Filter</button>
          <button className="kh-btn">⊡</button>
          <button className="kh-btn kh-btn--primary">+ Add family</button>
        </div>
      </header>

      <div className="kh-content">
        <div style={{ marginBottom: 6 }}>
          <h1 className="kh-h1">Families</h1>
          <p className="kh-sub">124 total · 98 active · 14 waitlist · 12 paused</p>
        </div>

        <div className="kh-tabs">
          {[
            { label: "All", count: 124, active: true },
            { label: "Active", count: 98 },
            { label: "Waitlist", count: 14 },
            { label: "Paused", count: 12 },
            { label: "Balance due", count: 2 },
          ].map((t) => (
            <button key={t.label} className={`kh-tab ${t.active ? "kh-tab--active" : ""}`}>
              {t.label} {t.count !== undefined && <span className="kh-tab-count">{t.count}</span>}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div className="kh-search-inline">
            <span style={{ fontSize: 12, opacity: .5 }}>🔍</span>
            <span style={{ fontSize: 12, color: "var(--kh-ink-400)" }}>Search families, parents, kids...</span>
            <kbd className="kh-search-kbd">/</kbd>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={families}
          getRowKey={(f) => f.id}
          getRowClassName={(f) => f.checked ? "kh-table-row--selected" : ""}
        />
      </div>
    </div>
  )
}
