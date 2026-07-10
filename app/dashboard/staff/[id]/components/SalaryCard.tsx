"use client"

import type { SalaryTracking } from "@/app/api/modules/salary_tracking/salary_tracking.types"
import { Field, } from "./Field"

export function SalaryCard({ salary }: { salary?: SalaryTracking | null }) {
  return (
    <>
      <div className="kh-card">
        <div className="kh-card-header">
          <span className="kh-card-title">Salary</span>
        </div>

           <div style={{ padding: "4px 18px 4px" }}>
            <Field label="Date"    name="_date"    value={salary?.date    ?? "—"} disabled />
            <Field
              label="Salary"
              name="_salary"
              value={
                salary
                  ? `${salary.salary} ${salary.symbol}`
                  : "—"
              }
              disabled
            />
          </div>
      </div>
    </>
  )
}
