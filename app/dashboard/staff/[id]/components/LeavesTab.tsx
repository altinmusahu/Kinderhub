"use client"

import { useState, useTransition } from "react"
import { Modal, MField, MInput, MSelect, MBtn } from "@/components/ui/Modal"
import { EditBalanceModal } from "@/app/dashboard/staff/components/EditBalanceModal"
import type { LeaveRequest, LeaveRequestWithUser, LeaveSummary, LeaveType } from "@/app/api/modules/leave_requests/leave_requests.types"

// These roles must never see the balance editor, full stop — not derived from the
// permission-level system, since editing vacation entitlement is not something any
// employee-facing role should be able to do regardless of their "staff" access level.
const ROLES_BLOCKED_FROM_EDITING_BALANCE = ["Lead Teacher", "Staff", "Assistant"]

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

function fmtReviewedDate(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
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

function RequestLeaveModal({ userId, onCreated }: { userId: string; onCreated: (row: LeaveRequest) => void }) {
  const [open, setOpen] = useState(false)
  const [saving, startSave] = useTransition()
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body = {
      leave_type: fd.get("leave_type"),
      start_date: fd.get("start_date"),
      end_date: fd.get("end_date"),
      reason: fd.get("reason") || undefined,
    }
    startSave(async () => {
      const res = await fetch(`/api/users/${userId}/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const row: LeaveRequest = await res.json()
        onCreated(row)
        setOpen(false)
        setError("")
      } else {
        const d = await res.json().catch(() => ({}))
        setError(d?.error ?? "Failed to submit request.")
      }
    })
  }

  return (
    <>
      <button className="kh-btn kh-btn--primary" style={{ fontSize: 12.5 }} onClick={() => setOpen(true)}>
        + Request leave
      </button>
      <Modal
        open={open}
        onClose={() => { setOpen(false); setError("") }}
        title="Request leave"
        sub="Submit a new leave request for review"
        width={480}
        footer={
          <>
            <MBtn variant="secondary" onClick={() => { setOpen(false); setError("") }}>Cancel</MBtn>
            <MBtn type="submit" variant="accent" disabled={saving} onClick={() => (document.getElementById("request-leave-form") as HTMLFormElement)?.requestSubmit()}>
              {saving ? "Submitting…" : "Submit request"}
            </MBtn>
          </>
        }
      >
        <form id="request-leave-form" onSubmit={handleSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <MField label="Leave type" required>
            <MSelect name="leave_type" required defaultValue="annual">
              {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </MSelect>
          </MField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <MField label="Start date" required>
              <MInput name="start_date" type="date" required />
            </MField>
            <MField label="End date" required>
              <MInput name="end_date" type="date" required />
            </MField>
          </div>
          <MField label="Reason" optional>
            <MInput name="reason" placeholder="e.g. Family trip" />
          </MField>
          {error && <p style={{ fontSize: 12, color: "#D2592F", margin: 0 }}>{error}</p>}
        </form>
      </Modal>
    </>
  )
}

export function LeavesTab({ userId, canReview, viewerRole }: { userId: string; canReview: boolean; viewerRole: string }) {
  const canEditBalance = canReview && !ROLES_BLOCKED_FROM_EDITING_BALANCE.includes(viewerRole)
  const [history, setHistory] = useState<LeaveRequestWithUser[] | null>(null)
  const [summary, setSummary] = useState<LeaveSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function load() {
    if (loaded) return
    setLoading(true)
    const res = await fetch(`/api/users/${userId}/leaves`)
    const data = await res.json()
    setHistory(Array.isArray(data?.history) ? data.history : [])
    setSummary(data?.summary ?? null)
    setLoading(false)
    setLoaded(true)
  }

  if (!loaded && !loading) { load() }

  function handleCreated(row: LeaveRequest) {
    const withUser: LeaveRequestWithUser = { ...row, user_name: "", user_lastname: "", reviewer_name: null, reviewer_lastname: null }
    setHistory(prev => [withUser, ...(prev ?? [])])
    setSummary(prev => prev ? { ...prev, pending: prev.pending + Number(row.total_days), remaining: Math.max(0, prev.remaining - Number(row.total_days)) } : prev)
  }

  async function handleCancel(row: LeaveRequestWithUser) {
    setCancelling(row.id)
    const res = await fetch(`/api/users/${userId}/leaves/${row.id}`, { method: "DELETE" })
    if (res.ok) {
      setHistory(prev => (prev ?? []).map(r => r.id === row.id ? { ...r, status: "cancelled" } : r))
    } else {
      setError("Failed to cancel request.")
    }
    setCancelling(null)
  }

  return (
    <div style={{ padding: "20px 28px 40px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontFamily: "var(--kh-font-serif)", fontSize: 22, margin: 0 }}>Leaves</h2>
          <p style={{ fontSize: 13, color: "var(--kh-ink-400)", margin: "4px 0 0" }}>Leave history and requests</p>
        </div>
        <RequestLeaveModal userId={userId} onCreated={handleCreated} />
      </div>

      {error && <p style={{ fontSize: 12, color: "#D2592F", marginBottom: 12 }}>{error}</p>}

      {(loading || !loaded) && (
        <div style={{ padding: 32, textAlign: "center", color: "var(--kh-ink-400)", fontSize: 13 }}>Loading leave data…</div>
      )}

      {loaded && summary && (
        <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
          <StatTile label="Entitled this year" value={summary.entitled} sub={summary.carriedOver > 0 ? `${summary.entitled - summary.carriedOver} + ${summary.carriedOver} carried` : "annual allowance"} />
          <StatTile label="Used" value={summary.used} sub="days taken" />
          <StatTile label="Pending" value={summary.pending} sub="awaiting review" accent={summary.pending > 0 ? "#C88F1A" : undefined} />
          <StatTile label="Remaining" value={summary.remaining} sub="available now" accent="var(--kh-sage)" />
        </div>
      )}

      {loaded && summary && canEditBalance && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
          <EditBalanceModal userId={userId} summary={summary} onSaved={setSummary} />
        </div>
      )}

      {loaded && (!history || history.length === 0) && (
        <div style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 22, color: "var(--kh-ink-900)", marginBottom: 8 }}>No leave requests yet</div>
          <div style={{ fontSize: 13, color: "var(--kh-ink-400)" }}>Submit one using the button above.</div>
        </div>
      )}

      {loaded && history && history.length > 0 && (
        <div className="kh-card" style={{ overflow: "hidden" }}>
          <div className="kh-card-header">
            <span className="kh-card-title">Leave history</span>
            <span className="kh-card-meta">{history.length} requests</span>
          </div>
          <div className="kh-table-scroll">
            <table className="kh-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Reviewed by</th>
                  <th>Reviewed date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {history.map(row => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 500, color: "var(--kh-ink-900)" }}>{LEAVE_TYPE_LABELS[row.leave_type]}</td>
                    <td style={{ fontFamily: "var(--kh-font-mono)", fontSize: 12, color: "var(--kh-ink-600)" }}>{fmtDateRange(row.start_date, row.end_date)}</td>
                    <td style={{ color: "var(--kh-ink-600)" }}>{row.total_days}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td style={{ fontSize: 12, color: "var(--kh-ink-500)", maxWidth: 220 }}>{row.reason || "—"}</td>
                    <td style={{ fontSize: 12, color: "var(--kh-ink-500)" }}>
                      {row.reviewer_name ? `${row.reviewer_name} ${row.reviewer_lastname ?? ""}`.trim() : "—"}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--kh-ink-400)" }}>{fmtReviewedDate(row.reviewed_at)}</td>
                    <td>
                      {row.status === "pending" && (
                        <button
                          className="kh-btn"
                          style={{ fontSize: 11.5, color: "#D2592F", borderColor: "#F0C4A8" }}
                          onClick={() => handleCancel(row)}
                          disabled={cancelling === row.id}
                        >
                          {cancelling === row.id ? "…" : "Cancel"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
