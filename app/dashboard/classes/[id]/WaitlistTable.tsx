"use client"

import { useState, useTransition } from "react"
import { Trash2, Plus, X, Loader2 } from "lucide-react"
import type { WaitlistEntry } from "@/app/api/modules/waitlist/waitlist.types"

function formatAge(dob: string): string {
  const birth = new Date(dob)
  const now = new Date()
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  return months > 0 ? `${years}y ${months}m` : `${years}y`
}

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
}

type AddForm = { firstname: string; lastname: string; date_of_birth: string; note: string }
const EMPTY_FORM: AddForm = { firstname: "", lastname: "", date_of_birth: "", note: "" }

export default function WaitlistTable({
  classId,
  initial,
}: {
  classId: string
  initial: WaitlistEntry[]
}) {
  const [entries, setEntries] = useState<WaitlistEntry[]>(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<AddForm>(EMPTY_FORM)
  const [addError, setAddError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAdd() {
    if (!form.firstname.trim() || !form.lastname.trim() || !form.date_of_birth) {
      setAddError("First name, last name and date of birth are required.")
      return
    }
    setAddError(null)
    startTransition(async () => {
      const res = await fetch(`/api/waitlist/${classId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        setAddError("Failed to add to waitlist.")
        return
      }
      const entry: WaitlistEntry = await res.json()
      setEntries((prev) => [...prev, entry])
      setForm(EMPTY_FORM)
      setShowAdd(false)
    })
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const res = await fetch(`/api/waitlist/entry/${id}`, { method: "DELETE" })
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id))
    }
    setDeletingId(null)
  }

  return (
    <div className="kh-card" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", padding: "14px 16px 10px",
        borderBottom: "1px solid var(--kh-ink-100)",
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Waitlist</span>
        <span style={{ marginLeft: 8, fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>
          {entries.length} waiting
        </span>
        <button
          onClick={() => { setShowAdd(true); setAddError(null) }}
          style={{
            marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5,
            padding: "5px 10px", fontSize: 11.5, borderRadius: 8, cursor: "pointer",
            background: "var(--kh-peach)", color: "#fff",
            border: "1px solid var(--kh-peach-d)",
          }}
        >
          <Plus size={12} /> Add to waitlist
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{
          padding: "14px 16px", borderBottom: "1px solid var(--kh-ink-100)",
          background: "var(--kh-peach-bg)", display: "flex", flexDirection: "column", gap: 10,
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="First name *"
              value={form.firstname}
              onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Last name *"
              value={form.lastname}
              onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))}
              style={inputStyle}
            />
            <input
              type="date"
              placeholder="Date of birth *"
              value={form.date_of_birth}
              onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
              style={{ ...inputStyle, width: 150 }}
            />
          </div>
          <input
            type="text"
            placeholder="Note (optional) — e.g. Sibling priority"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            style={inputStyle}
          />
          {addError && (
            <span style={{ fontSize: 11.5, color: "var(--kh-pink-d)" }}>{addError}</span>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleAdd}
              disabled={isPending}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "6px 14px", fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: "pointer",
                background: isPending ? "var(--kh-ink-200)" : "var(--kh-peach)",
                color: isPending ? "var(--kh-ink-400)" : "#fff",
                border: "none",
              }}
            >
              {isPending && <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />}
              {isPending ? "Adding…" : "Add"}
            </button>
            <button
              onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); setAddError(null) }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "6px 12px", fontSize: 12, borderRadius: 8, cursor: "pointer",
                background: "transparent", border: "1px solid var(--kh-ink-200)",
                color: "var(--kh-ink-600)",
              }}
            >
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {entries.length === 0 ? (
        <div style={{ padding: "28px 16px", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>
          No children on the waitlist for this class.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr>
              {["#", "Child", "Date of birth", "Age", "Note", ""].map((h) => (
                <th key={h} style={{
                  textAlign: "left", fontWeight: 500, color: "var(--kh-ink-400)",
                  fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em",
                  padding: "10px 14px", borderBottom: "1px solid var(--kh-ink-100)",
                  fontFamily: "var(--kh-font-mono)",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.id}>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--kh-ink-50)", verticalAlign: "middle", width: 32 }}>
                  <span style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11, color: "var(--kh-ink-400)" }}>
                    #{i + 1}
                  </span>
                </td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--kh-ink-50)", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                      background: "var(--kh-peach-bg)", color: "var(--kh-peach-d)",
                      fontSize: 10, fontWeight: 700,
                    }}>
                      {initials(e.firstname, e.lastname)}
                    </span>
                    <span style={{ fontWeight: 600, color: "var(--kh-ink-900)" }}>
                      {e.firstname} {e.lastname}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--kh-ink-50)", verticalAlign: "middle", fontFamily: "var(--kh-font-mono)", fontSize: 11.5, color: "var(--kh-ink-600)" }}>
                  {new Date(e.date_of_birth).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--kh-ink-50)", verticalAlign: "middle", fontFamily: "var(--kh-font-mono)", fontSize: 11.5, color: "var(--kh-ink-600)" }}>
                  {formatAge(e.date_of_birth)}
                </td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--kh-ink-50)", verticalAlign: "middle", fontSize: 12, color: "var(--kh-ink-500)" }}>
                  {e.note ?? <span style={{ color: "var(--kh-ink-300)" }}>—</span>}
                </td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--kh-ink-50)", verticalAlign: "middle", width: 40 }}>
                  <button
                    onClick={() => handleDelete(e.id)}
                    disabled={deletingId === e.id}
                    title="Remove from waitlist"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 26, height: 26, borderRadius: 6, border: "none", cursor: "pointer",
                      background: "transparent", color: "var(--kh-ink-300)",
                    }}
                  >
                    {deletingId === e.id
                      ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                      : <Trash2 size={13} />
                    }
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  flex: 1, padding: "7px 10px", fontSize: 12.5, borderRadius: 8,
  border: "1px solid var(--kh-ink-200)", background: "var(--kh-surface)",
  color: "var(--kh-ink-800)", outline: "none",
}
