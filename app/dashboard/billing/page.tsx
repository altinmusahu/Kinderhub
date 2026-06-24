import React from "react"
import { DataTable, Column } from "@/app/components/dashboard/DataTable"

const invoices = [
  { id: "INV-2051", family: "Okafor-Lind",   fid: "OL", color: "#E8866A", amount: "$2,840.00", status: "Paid",    due: "Apr 10", method: "Visa · 4242" },
  { id: "INV-2050", family: "Castellanos",   fid: "C",  color: "#D97F8C", amount: "$1,120.00", status: "Overdue", due: "Apr 10", method: "ACH" },
  { id: "INV-2049", family: "Benitez-Ahmed", fid: "BA", color: "#6BA07C", amount: "$2,840.00", status: "Paid",    due: "Apr 10", method: "Visa · 1298" },
  { id: "INV-2048", family: "Park",          fid: "P",  color: "#C9AE4E", amount: "$1,480.00", status: "Paid",    due: "Apr 10", method: "ACH" },
  { id: "INV-2047", family: "Volkov",        fid: "V",  color: "#A07CB4", amount: "$2,840.00", status: "Due",     due: "Apr 10", method: "Invoice" },
  { id: "INV-2046", family: "Oduya",         fid: "O",  color: "#7CA0B4", amount: "$4,680.00", status: "Paid",    due: "Apr 10", method: "Mastercard" },
  { id: "INV-2045", family: "Brunner",       fid: "B",  color: "#B4A07C", amount: "$2,840.00", status: "Paid",    due: "Apr 10", method: "Visa · 7731" },
  { id: "INV-2044", family: "Osei",          fid: "O",  color: "#7CB49A", amount: "$1,480.00", status: "Paid",    due: "Apr 10", method: "Visa · 0041" },
  { id: "INV-2043", family: "Delacroix",     fid: "D",  color: "#C49A7C", amount: "$2,840.00", status: "Paid",    due: "Apr 10", method: "ACH" },
]

type Invoice = typeof invoices[0]

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Paid:    { bg: "#E8F5EC", color: "#3A8C50" },
  Overdue: { bg: "#FDEAEA", color: "#C0392B" },
  Due:     { bg: "#FEF3E2", color: "#B07A1A" },
}

const revenueMonths = [
  { label: "N", h: 55 }, { label: "D", h: 60 }, { label: "J", h: 58 },
  { label: "F", h: 62 }, { label: "M", h: 65 }, { label: "A", h: 70 },
]

const columns: Column<Invoice>[] = [
  {
    key: "id",
    header: "Invoice",
    cellStyle: { fontFamily: "var(--kh-font-mono)", fontSize: 12, color: "var(--kh-ink-400)" },
    cell: (inv) => inv.id,
  },
  {
    key: "family",
    header: "Family",
    cell: (inv) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="kh-avatar" style={{ background: inv.color + "22", color: inv.color, width: 24, height: 24, fontSize: 9 }}>{inv.fid}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--kh-ink-800)" }}>{inv.family}</span>
      </div>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    headerStyle: { textAlign: "right" },
    cellStyle: { textAlign: "right", fontFamily: "var(--kh-font-mono)", fontSize: 13, fontWeight: 600, color: "var(--kh-ink-900)" },
    cell: (inv) => inv.amount,
  },
  {
    key: "status",
    header: "Status",
    cell: (inv) => {
      const ss = STATUS_STYLE[inv.status] ?? STATUS_STYLE.Paid
      return (
        <span className="kh-status-badge" style={{ background: ss.bg, color: ss.color }}>
          <span className="kh-pill-dot" style={{ background: ss.color }} />
          {inv.status}
        </span>
      )
    },
  },
  {
    key: "due",
    header: "Due",
    cellStyle: { fontSize: 12, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" },
    cell: (inv) => inv.due,
  },
  {
    key: "method",
    header: "Method",
    cellStyle: { fontSize: 12, color: "var(--kh-ink-500)" },
    cell: (inv) => inv.method,
  },
]

export default function BillingPage() {
  return (
    <div className="kh-page">
      <header className="kh-topbar">
        <nav className="kh-breadcrumb">
          <span className="kh-breadcrumb-parent">Kinderhub</span>
          <span className="kh-breadcrumb-sep">/</span>
          <span className="kh-breadcrumb-current">Billing</span>
        </nav>
        <div className="kh-topbar-right">
          <button className="kh-btn">↑ Export</button>
          <button className="kh-btn">✉ Send reminders</button>
          <button className="kh-btn kh-btn--primary">+ New invoice</button>
        </div>
      </header>

      <div className="kh-content">
        <div style={{ marginBottom: 14 }}>
          <h1 className="kh-h1">Billing</h1>
          <p className="kh-sub">April cycle · 9 families · auto-charged Apr 10</p>
        </div>

        <div className="kh-stats-grid" style={{ marginBottom: 4 }}>
          {[
            { label: "Collected this month", value: "$24,960", sub: "92% of expected" },
            { label: "Outstanding",          value: "$3,960",  sub: "2 invoices"      },
            { label: "Autopay families",     value: "68",      sub: "/ 98 active"     },
            { label: "Avg. tuition",         value: "$2,740",  sub: "per family / mo" },
          ].map((s, i) => (
            <div key={i} className="kh-card kh-stat-card">
              <div className="kh-stat-label">{s.label}</div>
              <div className="kh-stat-value-row">
                <span className="kh-stat-value">{s.value}</span>
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 12 }}>
          <DataTable
            columns={columns}
            rows={invoices}
            getRowKey={(inv) => inv.id}
            title="Invoices · April"
            meta="9 total"
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="kh-card" style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span className="kh-card-title">Revenue · last 6 months</span>
                <span style={{ fontSize: 10, fontFamily: "var(--kh-font-mono)", color: "var(--kh-ink-400)", background: "var(--kh-ink-50)", border: "1px solid var(--kh-border)", borderRadius: 4, padding: "2px 6px" }}>MRR</span>
              </div>
              <div style={{ fontSize: 24, fontFamily: "var(--kh-font-serif)", fontWeight: 700, color: "var(--kh-ink-900)", marginBottom: 4 }}>$28,920</div>
              <div style={{ fontSize: 12, color: "#3A8C50", marginBottom: 14 }}>● +4.2% vs. March · $27,760</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
                {revenueMonths.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ width: "100%", height: m.h + "%", background: i === revenueMonths.length - 1 ? "var(--kh-peach)" : "var(--kh-ink-100)", borderRadius: "4px 4px 2px 2px" }} />
                    <span style={{ fontSize: 10, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="kh-card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span className="kh-card-title">At risk</span>
                <span style={{ fontSize: 11, fontFamily: "var(--kh-font-mono)", background: "#FDEAEA", color: "#C0392B", borderRadius: 99, padding: "1px 7px" }}>2</span>
              </div>
              {[
                { id: "C", name: "Castellanos", color: "#D97F8C", amount: "$1128", note: "14 days overdue" },
                { id: "V", name: "Volkov",       color: "#A07CB4", amount: "$448",  note: "Due in 3 days"  },
              ].map((r) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid var(--kh-border-soft)" }}>
                  <span className="kh-avatar" style={{ background: r.color + "22", color: r.color }}>{r.id}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--kh-ink-800)" }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>{r.note}</div>
                  </div>
                  <span style={{ fontFamily: "var(--kh-font-mono)", fontSize: 13, fontWeight: 600, color: "#C0392B" }}>{r.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
