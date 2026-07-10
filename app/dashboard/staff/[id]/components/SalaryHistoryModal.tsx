"use client"

import { useState, useEffect, useTransition } from "react"
import type { SalaryRow } from "./types"

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

function fmtMoney(n: number) {
  return `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const fieldStyle: React.CSSProperties = {
  background: "var(--kh-ink-50)", border: "1px solid var(--kh-border)", borderRadius: 6,
  padding: "6px 10px", fontSize: 12.5, fontFamily: "inherit", outline: "none", width: "100%",
  color: "var(--kh-ink-900)", boxSizing: "border-box",
}

const labelStyle: React.CSSProperties = {
  fontSize: 11.5, color: "var(--kh-ink-400)", marginBottom: 4, display: "block",
}

function AddRecordForm({ userId, onAdded }: { userId: string; onAdded: (row: SalaryRow) => void }) {
  const [open, setOpen] = useState(false)
  const [saving, startSave] = useTransition()
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body = { date: fd.get("date"), salary: fd.get("salary") }
    startSave(async () => {
      const res = await fetch(`/api/users/${userId}/salary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const newRow: SalaryRow = await res.json()
        onAdded(newRow)
        setOpen(false)
        setError("")
        ;(e.target as HTMLFormElement).reset()
      } else {
        const d = await res.json().catch(() => ({}))
        setError(d?.error ?? "Failed to create record.")
      }
    })
  }

  if (!open) {
    return (
      <button
        className="kh-btn kh-btn--primary"
        style={{ fontSize: 12.5, width: "100%" }}
        onClick={() => setOpen(true)}
      >
        + New salary record
      </button>
    )
  }

  return (
    <div style={{ background: "var(--kh-ink-50)", border: "1px solid var(--kh-border)", borderRadius: 10, padding: "16px 18px" }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--kh-ink-900)", marginBottom: 14 }}>
        New salary record
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label style={labelStyle}>Effective date *</label>
            <input name="date" type="date" required style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Salary amount *</label>
            <input name="salary" type="number" step="0.01" min="0.01" required placeholder="e.g. 3500" style={fieldStyle} />
          </div>
        </div>

        {error && <p style={{ fontSize: 12, color: "#D2592F", marginTop: 10 }}>{error}</p>}

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button type="submit" disabled={saving} className="kh-btn kh-btn--primary" style={{ fontSize: 12.5 }}>
            {saving ? "Saving…" : "Create record"}
          </button>
          <button type="button" className="kh-btn" style={{ fontSize: 12.5 }} onClick={() => { setOpen(false); setError("") }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export function SalaryHistoryModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [history, setHistory] = useState<SalaryRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/users/${userId}/salary`)
      .then(r => r.json())
      .then(d => { setHistory(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => { setError("Failed to load history."); setLoading(false) })
  }, [userId])

  function handleAdded(newRow: SalaryRow) {
    setHistory(prev => {
      if (!prev) return [newRow]
      // mark the previous current record as superseded in UI
      return [newRow, ...prev.map(r => ({ ...r, is_active: false }))]
    })
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}
      onClick={onClose}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />

      <div
        style={{
          position: "relative", zIndex: 1,
          width: 500, height: "100vh",
          background: "var(--kh-surface)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--kh-border)", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 20, color: "var(--kh-ink-900)" }}>Salary History</div>
            <div style={{ fontSize: 12, color: "var(--kh-ink-400)", marginTop: 2 }}>All salary records</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--kh-ink-400)", lineHeight: 1, padding: 4 }}
          >
            ✕
          </button>
        </div>

        {/* scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Add record */}
          <AddRecordForm userId={userId} onAdded={handleAdded} />

          {/* divider */}
          {!loading && history && history.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: "var(--kh-border)" }} />
              <span style={{ fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>History</span>
              <div style={{ flex: 1, height: 1, background: "var(--kh-border)" }} />
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: 40, color: "var(--kh-ink-400)", fontSize: 13 }}>Loading…</div>
          )}
          {error && (
            <div style={{ color: "#D2592F", fontSize: 13 }}>{error}</div>
          )}
          {!loading && !error && history && history.length === 0 && (
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 13, color: "var(--kh-ink-400)" }}>No salary records yet.</div>
            </div>
          )}

          {!loading && !error && history && history.length > 0 && (
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 11, top: 8, bottom: 8, width: 2, background: "var(--kh-border)" }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                {history.map((s, i) => (
                  <div key={s.id} style={{ display: "flex", gap: 18, paddingBottom: i < history.length - 1 ? 24 : 0 }}>
                    <div style={{ flexShrink: 0, width: 24, display: "flex", justifyContent: "center", paddingTop: 3 }}>
                      <div style={{
                        width: 12, height: 12, borderRadius: "50%",
                        background: s.is_active ? "var(--kh-peach)" : "var(--kh-border)",
                        border: s.is_active ? "2px solid #F0C4A8" : "2px solid var(--kh-border-soft)",
                        boxSizing: "border-box",
                        position: "relative", zIndex: 1,
                      }} />
                    </div>

                    <div style={{ flex: 1, paddingBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--kh-ink-900)" }}>
                          {fmtMoney(s.salary)}
                        </span>
                        {s.is_active && (
                          <span style={{ fontSize: 10, fontWeight: 600, background: "#E8F5EC", color: "#3A8C50", borderRadius: 99, padding: "2px 8px" }}>
                            Current
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>
                        Effective {fmtDate(s.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
