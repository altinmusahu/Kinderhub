"use client"

import { useState, useTransition } from "react"
import { avatarColor, initials } from "@/components/ui/helper"
import { EditBalanceModal } from "./EditBalanceModal"
import type { LeaveRequestWithUser, LeaveSummary, LeaveType, TenantLeaveSummary } from "@/app/api/modules/leave_requests/leave_requests.types"
import type { UserWithWorkTrackingAndDepartment } from "@/app/api/modules/user/user.types"

const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  annual: "Annual",
  sick: "Sick",
  unpaid: "Unpaid",
  maternity: "Maternity",
  paternity: "Paternity",
  bereavement: "Bereavement",
  personal: "Personal",
}

const STATUS_STYLES: Record<string, { bg: string; fg: string; dot: string }> = {
  pending:   { bg: "#FDF6E3", fg: "#C88F1A", dot: "#F3B43C" },
  approved:  { bg: "#E8F5EC", fg: "#3A8C50", dot: "#3A8C50" },
  rejected:  { bg: "#FAEAEA", fg: "#C06060", dot: "#C06060" },
  cancelled: { bg: "#F0EDE8", fg: "#7A7368", dot: "#9E968A" },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.cancelled
  return (
    <span className="kh-status-badge" style={{ background: s.bg, color: s.fg }}>
      <span className="kh-pill-dot" style={{ background: s.dot }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function fmtDateRange(start: string, end: string) {
  return start === end ? fmtDate(start) : `${fmtDate(start)} – ${fmtDate(end)}`
}

const statTile: React.CSSProperties = {
  flex: 1, padding: "14px 16px", background: "var(--kh-surface)",
  border: "1px solid var(--kh-border)", borderRadius: 14,
}

function StatTile({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub: string; accent?: string }) {
  return (
    <div style={statTile}>
      <div style={{ fontSize: 10, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 26, color: accent ?? "var(--kh-ink-900)", marginTop: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--kh-ink-400)", marginTop: 2 }}>{sub}</div>
    </div>
  )
}

// These roles must never see the balance editor, full stop — not derived from the
// permission-level system, since editing vacation entitlement is not something any
// employee-facing role should be able to do regardless of their "staff" access level.
const ROLES_BLOCKED_FROM_EDITING_BALANCE = ["Lead Teacher", "Staff", "Assistant"]

const selectStyle: React.CSSProperties = {
  padding: "7px 10px", border: "1px solid var(--kh-border)", borderRadius: 8,
  background: "var(--kh-surface)", fontSize: 12.5, color: "var(--kh-ink-700)",
  fontFamily: "inherit", outline: "none",
}

function EmployeeBalanceRow({ userId, name, color, ini }: { userId: string; name: string; color: string; ini: string }) {
  const [summary, setSummary] = useState<LeaveSummary | null>(null)
  const [loaded, setLoaded] = useState(false)

  if (!loaded) {
    setLoaded(true)
    fetch(`/api/users/${userId}/leaves`)
      .then(r => r.json())
      .then(data => setSummary(data?.summary ?? null))
      .catch(() => {})
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px", borderTop: "1px solid var(--kh-border-soft)" }}>
      <span className="kh-avatar" style={{ background: color + "22", color, fontSize: 10, flexShrink: 0 }}>{ini}</span>
      <span style={{ flex: 1, fontSize: 12.5, color: "var(--kh-ink-800)" }}>{name}</span>
      {summary ? (
        <>
          <span style={{ fontSize: 11.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>
            {summary.entitled} entitled{summary.carriedOver > 0 ? ` (${summary.carriedOver} carried)` : ""}
          </span>
          <EditBalanceModal
            userId={userId}
            summary={summary}
            onSaved={setSummary}
            trigger={(open) => (
              <button className="kh-btn" style={{ fontSize: 11.5 }} onClick={open}>✎ Edit</button>
            )}
          />
        </>
      ) : (
        <span style={{ fontSize: 11.5, color: "var(--kh-ink-300)" }}>Loading…</span>
      )}
    </div>
  )
}

function ReviewButtons({ row, onReview }: { row: LeaveRequestWithUser; onReview: (id: string, status: "approved" | "rejected") => void }) {
  const [pending, startTransition] = useTransition()
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button
        className="kh-btn"
        style={{ fontSize: 11.5, color: "#3A8C50", borderColor: "#B7DCC0" }}
        disabled={pending}
        onClick={() => startTransition(() => onReview(row.id, "approved"))}
      >
        ✓ Approve
      </button>
      <button
        className="kh-btn"
        style={{ fontSize: 11.5, color: "#C06060", borderColor: "#EFC4C4" }}
        disabled={pending}
        onClick={() => startTransition(() => onReview(row.id, "rejected"))}
      >
        ✕ Reject
      </button>
    </div>
  )
}

// Shows every staff member's leave requests within the current tenant (not across
// different tenants — Kinderhub is multi-tenant, but this view, like every query in
// the app, is already scoped to session.tenant_id). "Admin" here just means it needs
// edit/full staff permission, as opposed to the single-employee LeavesTab.
export function StaffLeavesAdminTab({ staff, initialRequests, initialSummary, viewerRole }: {
  staff: UserWithWorkTrackingAndDepartment[]
  initialRequests: LeaveRequestWithUser[]
  initialSummary: TenantLeaveSummary
  viewerRole: string
}) {
  const canEditBalances = !ROLES_BLOCKED_FROM_EDITING_BALANCE.includes(viewerRole)
  const [requests, setRequests] = useState(initialRequests)
  const [summary, setSummary] = useState(initialSummary)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [error, setError] = useState("")
  const [showBalances, setShowBalances] = useState(false)

  const filtered = requests.filter((r) => {
    const name = `${r.user_name} ${r.user_lastname}`.toLowerCase()
    if (search && !name.includes(search.toLowerCase())) return false
    if (typeFilter !== "all" && r.leave_type !== typeFilter) return false
    if (statusFilter !== "all" && r.status !== statusFilter) return false
    return true
  })

  async function handleReview(userId: string, leaveId: string, status: "approved" | "rejected") {
    const res = await fetch(`/api/users/${userId}/leaves/${leaveId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setRequests(prev => prev.map(r => r.id === leaveId ? { ...r, ...updated } : r))
      setSummary(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approvedThisMonth: status === "approved" ? prev.approvedThisMonth + 1 : prev.approvedThisMonth,
      }))
    } else {
      setError("Failed to update the request. Please try again.")
    }
  }

  return (
    <div style={{ padding: "20px 28px 40px" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 className="kh-h1" style={{ margin: 0 }}>Leaves</h1>
        <p style={{ fontSize: 13, color: "var(--kh-ink-400)", margin: "4px 0 0" }}>
          All staff requests across both houses · approve or reject pending items
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <StatTile label="Pending requests" value={summary.pending} sub="tenant-wide" accent={summary.pending > 0 ? "#C88F1A" : undefined} />
        <StatTile label="Approved this month" value={summary.approvedThisMonth} sub={new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })} />
        <StatTile label="On leave today" value={summary.onLeaveToday} sub="across both houses" />
        <StatTile label="Requested this year" value={summary.requestedThisYear} sub="days · all types" />
      </div>

      {canEditBalances && (
        <div className="kh-card" style={{ padding: "12px 16px", marginBottom: 18 }}>
          <button
            onClick={() => setShowBalances(v => !v)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
              background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-900)" }}>Leave balances</span>
            <span style={{ fontSize: 12, color: "var(--kh-ink-400)" }}>{showBalances ? "Hide ▲" : "Set per-employee entitlement ▼"}</span>
          </button>
          {showBalances && (
            <div style={{ marginTop: 8 }}>
              {staff.map((s) => (
                <EmployeeBalanceRow
                  key={s.id}
                  userId={s.id}
                  name={`${s.name} ${s.lastname}`}
                  color={avatarColor(s.id)}
                  ini={initials(s.name, s.lastname)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <input
          placeholder="Search staff name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...selectStyle, minWidth: 220, background: "var(--kh-ink-50)" }}
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
          <option value="all">Type · All</option>
          {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="all">Status · All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && <p style={{ fontSize: 12, color: "#D2592F", marginBottom: 12 }}>{error}</p>}

      {filtered.length === 0 ? (
        <div className="kh-card" style={{ padding: "40px 24px", textAlign: "center", color: "var(--kh-ink-400)", fontSize: 13 }}>
          No leave requests match these filters.
        </div>
      ) : (
        <div className="kh-card" style={{ overflow: "hidden" }}>
          <div className="kh-card-header">
            <span className="kh-card-title">All requests</span>
            <span className="kh-card-meta">{filtered.length} records</span>
          </div>
          <div className="kh-table-scroll">
            <table className="kh-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const ac = avatarColor(row.user_id)
                  const ini = initials(row.user_name, row.user_lastname)
                  const reviewerName = row.reviewer_name ? `${row.reviewer_name} ${row.reviewer_lastname ?? ""}`.trim() : null
                  return (
                    <tr key={row.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="kh-avatar" style={{ background: ac + "22", color: ac, fontSize: 10 }}>{ini}</span>
                          <span style={{ fontWeight: 500, color: "var(--kh-ink-900)" }}>{row.user_name} {row.user_lastname}</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--kh-ink-700)" }}>{LEAVE_TYPE_LABELS[row.leave_type]}</td>
                      <td style={{ fontFamily: "var(--kh-font-mono)", fontSize: 12, color: "var(--kh-ink-600)" }}>{fmtDateRange(row.start_date, row.end_date)}</td>
                      <td style={{ color: "var(--kh-ink-600)" }}>{row.total_days}</td>
                      <td>
                        <StatusBadge status={row.status} />
                        {row.status === "rejected" && row.review_note && (
                          <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", marginTop: 3, maxWidth: 180 }}>{row.review_note}</div>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: "var(--kh-ink-500)", maxWidth: 200 }}>{row.reason || "—"}</td>
                      <td style={{ fontSize: 12, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>{fmtDate(row.created_at)}</td>
                      <td>
                        {row.status === "pending" ? (
                          <ReviewButtons row={row} onReview={(id, status) => handleReview(row.user_id, id, status)} />
                        ) : (
                          <span style={{ fontSize: 11.5, color: "var(--kh-ink-400)" }}>{reviewerName ?? "—"}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
