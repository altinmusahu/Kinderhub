"use client"

import { useState, useTransition } from "react"
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

function AddSalaryForm({ userId, onAdded }: { userId: string; onAdded: (row: SalaryRow) => void }) {
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
        setError(d?.error ?? "Failed to save salary record.")
      }
    })
  }

  if (!open) {
    return (
      <button className="kh-btn kh-btn--primary" style={{ fontSize: 12.5 }} onClick={() => setOpen(true)}>
        + Add salary update
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
            {saving ? "Saving…" : "Save record"}
          </button>
          <button type="button" className="kh-btn" style={{ fontSize: 12.5 }} onClick={() => { setOpen(false); setError("") }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export function SalaryTab({ userId }: { userId: string }) {
  const [rows, setRows] = useState<SalaryRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function load() {
    if (loaded) return
    setLoading(true)
    const res = await fetch(`/api/users/${userId}/salary`)
    const data = await res.json()
    setRows(Array.isArray(data) ? data : [])
    setLoading(false)
    setLoaded(true)
  }

  if (!loaded && !loading) { load() }

  function handleAdded(newRow: SalaryRow) {
    setRows(prev => [newRow, ...(prev ?? []).map(r => ({ ...r, is_active: false }))])
  }

  async function handleDelete(row: SalaryRow) {
    setDeleting(row.id)
    const res = await fetch(`/api/users/${userId}/salary`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salaryId: row.id }),
    })
    if (res.ok) {
      setRows(prev => (prev ?? []).filter(r => r.id !== row.id))
    } else {
      setError("Delete failed.")
    }
    setDeleting(null)
  }

  const current = rows?.find(r => r.is_active) ?? null

  return (
    <div style={{ padding: "20px 28px 40px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontFamily: "var(--kh-font-serif)", fontSize: 22, margin: 0 }}>Salary</h2>
          <p style={{ fontSize: 13, color: "var(--kh-ink-400)", margin: "4px 0 0" }}>Compensation history for this employee</p>
        </div>
        <AddSalaryForm userId={userId} onAdded={handleAdded} />
      </div>

      {error && <p style={{ fontSize: 12, color: "#D2592F", marginBottom: 12 }}>{error}</p>}

      {(loading || !loaded) && (
        <div style={{ padding: 32, textAlign: "center", color: "var(--kh-ink-400)", fontSize: 13 }}>Loading salary history…</div>
      )}

      {loaded && current && (
        <div className="kh-card" style={{
          padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(180deg,#FEF0E8,#FDE8DA)", border: "1px solid #F0C4A8",
        }}>
          <div>
            <div style={{ fontSize: 10.5, color: "#B24420", textTransform: "uppercase", letterSpacing: ".05em" }}>Current salary</div>
            <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 26, color: "#7A2810", marginTop: 4 }}>{fmtMoney(current.salary)}</div>
          </div>
          <div style={{ fontSize: 12, color: "#B24420" }}>Effective {fmtDate(current.date)}</div>
        </div>
      )}

      {loaded && (!rows || rows.length === 0) && (
        <div style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 22, color: "var(--kh-ink-900)", marginBottom: 8 }}>No salary records yet</div>
          <div style={{ fontSize: 13, color: "var(--kh-ink-400)" }}>Add one using the button above.</div>
        </div>
      )}

      {loaded && rows && rows.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map(row => (
            <div key={row.id} className="kh-card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--kh-ink-900)" }}>{fmtMoney(row.salary)}</div>
                {row.is_active && (
                  <span style={{ fontSize: 10, fontWeight: 600, background: "#E8F5EC", color: "#3A8C50", borderRadius: 99, padding: "2px 8px" }}>
                    Current
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", flexShrink: 0 }}>
                {fmtDate(row.date)}
              </div>
              <button
                className="kh-btn"
                style={{ fontSize: 12, color: "#D2592F", borderColor: "#F0C4A8", flexShrink: 0 }}
                onClick={() => handleDelete(row)}
                disabled={deleting === row.id}
              >
                {deleting === row.id ? "…" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
