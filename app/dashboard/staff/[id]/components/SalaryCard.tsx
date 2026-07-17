"use client"

import type { SalaryTracking } from "@/app/api/modules/salary_tracking/salary_tracking.types"

function fmtMoney(n: number, symbol?: string) {
  const amount = Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return symbol ? `${symbol}${amount}` : amount
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function SalaryCard({ salary }: { salary?: SalaryTracking | null }) {
  return (
    <div className="kh-card">
      <div className="kh-card-header">
        <span className="kh-card-title">Payroll</span>
        {salary && <span className="kh-card-meta">Effective {fmtDate(salary.date)}</span>}
      </div>

      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{ fontSize: 10, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>
          Base salary
        </div>
        <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 30, color: "var(--kh-ink-900)", marginTop: 4 }}>
          {salary ? fmtMoney(salary.salary, salary.symbol) : "—"}
        </div>
        <div style={{ fontSize: 12, color: "var(--kh-ink-400)", marginTop: 2 }}>
          {salary ? "per year · Salary" : "no salary record on file"}
        </div>
      </div>
    </div>
  )
}
