"use client"

import { useState, useTransition, useEffect } from "react"
import { Trash2, Plus, X, Loader2, Search } from "lucide-react"
import type { WaitlistEntry } from "@/app/api/modules/waitlist/waitlist.types"

type KidOption = { id: string; firstname: string; lastname: string; date_of_birth: string }

function formatAge(dob: string): string {
  const birth = new Date(dob)
  const now = new Date()
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  return months > 0 ? `${years}y ${months}m` : `${years}y`
}

function initials(first = "", last = "") {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
}

export default function WaitlistTable({
  classId,
  initial,
}: {
  classId: string
  initial: WaitlistEntry[]
}) {
  const [entries, setEntries] = useState<WaitlistEntry[]>(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [kids, setKids] = useState<KidOption[]>([])
  const [query, setQuery] = useState("")
  const [selectedKid, setSelectedKid] = useState<KidOption | null>(null)
  const [addError, setAddError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Load all kids (unassigned ones) when the add form opens
  useEffect(() => {
    if (!showAdd) return
    fetch(`/api/waitlist/${classId}`)
      .then(r => r.json())
      .then((d: KidOption[]) => setKids(Array.isArray(d) ? d : []))
      .catch(() => setKids([]))
  }, [showAdd])

  const filtered = query
    ? kids.filter(k => `${k.firstname} ${k.lastname}`.toLowerCase().includes(query.toLowerCase()))
    : kids

  function openAdd() {
    setShowAdd(true)
    setAddError(null)
    setSelectedKid(null)
    setQuery("")
  }

  function cancelAdd() {
    setShowAdd(false)
    setSelectedKid(null)
    setQuery("")
    setAddError(null)
  }

  async function handleAdd() {
    if (!selectedKid) { setAddError("Select a child first."); return }
    setAddError(null)
    startTransition(async () => {
      const res = await fetch(`/api/waitlist/${classId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kid_id: selectedKid.id }),
      })
      if (!res.ok) { setAddError("Failed to add to waitlist."); return }
      const entry: WaitlistEntry = await res.json()
      setEntries(prev => [...prev, entry])
      cancelAdd()
    })
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const res = await fetch(`/api/waitlist/entry/${id}`, { method: "DELETE" })
    if (res.ok) setEntries(prev => prev.filter(e => e.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="kh-card" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "14px 16px 10px", borderBottom: "1px solid var(--kh-ink-100)" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Waitlist</span>
        <span style={{ marginLeft: 8, fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>
          {entries.length} waiting
        </span>
        {/* <button
          onClick={openAdd}
          style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", fontSize: 11.5, borderRadius: 8, cursor: "pointer", background: "var(--kh-peach)", color: "#fff", border: "1px solid var(--kh-peach-d)" }}
        >
          <Plus size={12} /> Add to waitlist
        </button> */}
      </div>

      {/* Add form — kid search picker */}
      {showAdd && (
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--kh-ink-100)", background: "var(--kh-peach-bg)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--kh-ink-200)", borderRadius: 8, padding: "7px 10px", background: "var(--kh-surface)" }}>
            <Search size={13} style={{ color: "var(--kh-ink-400)", flexShrink: 0 }} />
            <input
              autoFocus
              type="text"
              placeholder="Search child by name…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: "var(--kh-ink-800)", width: "100%" }}
            />
          </div>

          {/* Kid list */}
          <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
            {filtered.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "var(--kh-ink-400)", textAlign: "center", padding: "12px 0" }}>
                {query ? "No children match." : "No unassigned children available."}
              </div>
            ) : filtered.map(kid => {
              const sel = selectedKid?.id === kid.id
              return (
                <button
                  key={kid.id}
                  type="button"
                  onClick={() => setSelectedKid(sel ? null : kid)}
                  style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer", background: sel ? "var(--kh-peach-bg)" : "var(--kh-surface)", outline: sel ? "2px solid var(--kh-peach)" : "none", outlineOffset: -1, textAlign: "left" }}
                >
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: sel ? "var(--kh-peach)" : "var(--kh-peach-bg)", color: sel ? "#fff" : "var(--kh-peach-d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                    {initials(kid.firstname, kid.lastname)}
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--kh-ink-800)", flex: 1 }}>{kid.firstname} {kid.lastname}</span>
                  {kid.date_of_birth && (
                    <span style={{ fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>{formatAge(kid.date_of_birth)}</span>
                  )}
                </button>
              )
            })}
          </div>

          {addError && <span style={{ fontSize: 11.5, color: "var(--kh-pink-d)" }}>{addError}</span>}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleAdd}
              disabled={isPending || !selectedKid}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px", fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: selectedKid && !isPending ? "pointer" : "not-allowed", background: selectedKid && !isPending ? "var(--kh-peach)" : "var(--kh-ink-200)", color: selectedKid && !isPending ? "#fff" : "var(--kh-ink-400)", border: "none" }}
            >
              {isPending && <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />}
              {isPending ? "Adding…" : selectedKid ? `Add ${selectedKid.firstname}` : "Add"}
            </button>
            <button
              onClick={cancelAdd}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", fontSize: 12, borderRadius: 8, cursor: "pointer", background: "transparent", border: "1px solid var(--kh-ink-200)", color: "var(--kh-ink-600)" }}
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
              {["#", "Child", "Date of birth", "Age", "Added", ""].map(h => (
                <th key={h} style={{ textAlign: "left", fontWeight: 500, color: "var(--kh-ink-400)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", padding: "10px 14px", borderBottom: "1px solid var(--kh-ink-100)", fontFamily: "var(--kh-font-mono)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.id}>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--kh-ink-50)", verticalAlign: "middle", width: 32 }}>
                  <span style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11, color: "var(--kh-ink-400)" }}>#{i + 1}</span>
                </td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--kh-ink-50)", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: "var(--kh-peach-bg)", color: "var(--kh-peach-d)", fontSize: 10, fontWeight: 700 }}>
                      {initials(e.firstname, e.lastname)}
                    </span>
                    <span style={{ fontWeight: 600, color: "var(--kh-ink-900)" }}>{e.firstname} {e.lastname}</span>
                  </div>
                </td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--kh-ink-50)", verticalAlign: "middle", fontFamily: "var(--kh-font-mono)", fontSize: 11.5, color: "var(--kh-ink-600)" }}>
                  {e.date_of_birth ? new Date(e.date_of_birth).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                </td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--kh-ink-50)", verticalAlign: "middle", fontFamily: "var(--kh-font-mono)", fontSize: 11.5, color: "var(--kh-ink-600)" }}>
                  {e.date_of_birth ? formatAge(e.date_of_birth) : "—"}
                </td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--kh-ink-50)", verticalAlign: "middle", fontFamily: "var(--kh-font-mono)", fontSize: 11, color: "var(--kh-ink-400)" }}>
                  {new Date(e.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--kh-ink-50)", verticalAlign: "middle", width: 40 }}>
                  <button
                    onClick={() => handleDelete(e.id)}
                    disabled={deletingId === e.id}
                    title="Remove from waitlist"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 6, border: "none", cursor: "pointer", background: "transparent", color: "var(--kh-ink-300)" }}
                  >
                    {deletingId === e.id ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={13} />}
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
