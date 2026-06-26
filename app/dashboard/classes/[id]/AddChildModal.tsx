"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Search, Loader2 } from "lucide-react"

type Kid = { id: string; firstname: string; lastname: string }

type Props = {
  classId: string
  onClose: () => void
  onSuccess: () => void
}

export default function AddChildModal({ classId, onClose, onSuccess }: Props) {
  const [kids, setKids] = useState<Kid[]>([])
  const [filtered, setFiltered] = useState<Kid[]>([])
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Kid | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/kids")
      .then((r) => r.json())
      .then((data: Kid[]) => {
        setKids(data)
        setFiltered(data)
      })
      .catch(() => setError("Failed to load children."))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = query.toLowerCase()
    setFiltered(
      q ? kids.filter((k) => `${k.firstname} ${k.lastname}`.toLowerCase().includes(q)) : kids
    )
  }, [query, kids])

  const handleAssign = useCallback(async () => {
    if (!selected) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/kids/${classId}/kids/${selected.id}`, { method: "PUT" })
      if (!res.ok) throw new Error("Failed to assign child.")
      onSuccess()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
    } finally {
      setSaving(false)
    }
  }, [selected, classId, onSuccess, onClose])

  return (
    /* Backdrop */
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(42,32,24,0.45)", backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Panel */}
      <div style={{
        background: "var(--kh-surface)", borderRadius: 18,
        width: "100%", maxWidth: 440, boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px 14px", borderBottom: "1px solid var(--kh-ink-100)",
        }}>
          <div>
            <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 20, color: "var(--kh-ink-900)", fontWeight: 400 }}>
              Add child to class
            </div>
            <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginTop: 2 }}>
              Only children not yet assigned to a class are shown.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8, border: "1px solid var(--kh-ink-100)",
              background: "var(--kh-bg)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--kh-ink-500)",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "14px 20px 10px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            border: "1px solid var(--kh-ink-200)", borderRadius: 10,
            padding: "8px 12px", background: "var(--kh-bg)",
          }}>
            <Search size={13} style={{ color: "var(--kh-ink-400)", flexShrink: 0 }} />
            <input
              autoFocus
              type="text"
              placeholder="Search by name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                border: "none", outline: "none", background: "transparent",
                fontSize: 13, color: "var(--kh-ink-800)", width: "100%",
              }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", maxHeight: 280, padding: "0 20px 8px" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0", gap: 8, color: "var(--kh-ink-400)" }}>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: 13 }}>Loading children…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", fontSize: 13, color: "var(--kh-ink-400)" }}>
              {query ? "No children match your search." : "All children are already assigned to a class."}
            </div>
          ) : (
            filtered.map((kid) => {
              const isSelected = selected?.id === kid.id
              return (
                <button
                  key={kid.id}
                  onClick={() => setSelected(isSelected ? null : kid)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: isSelected ? "var(--kh-peach-bg)" : "transparent",
                    outline: isSelected ? "2px solid var(--kh-peach)" : "none",
                    outlineOffset: -1,
                    marginBottom: 3, textAlign: "left", transition: "background 0.1s",
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: isSelected ? "var(--kh-peach)" : "var(--kh-peach-bg)",
                    color: isSelected ? "#fff" : "var(--kh-peach-d)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--kh-font-mono)", fontSize: 12, fontWeight: 700,
                  }}>
                    {kid.firstname[0]}{kid.lastname[0]}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--kh-ink-800)" }}>
                    {kid.firstname} {kid.lastname}
                  </span>
                  {isSelected && (
                    <span style={{
                      marginLeft: "auto", fontSize: 11, fontWeight: 600,
                      color: "var(--kh-peach-d)", fontFamily: "var(--kh-font-mono)",
                    }}>
                      Selected
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ margin: "0 20px 8px", padding: "8px 12px", background: "var(--kh-pink-bg)", borderRadius: 8, fontSize: 12, color: "var(--kh-pink-d)" }}>
            {error}
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: "14px 20px", borderTop: "1px solid var(--kh-ink-100)",
          display: "flex", gap: 8, justifyContent: "flex-end",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: "1px solid var(--kh-ink-200)", background: "var(--kh-bg)",
              color: "var(--kh-ink-700)", cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selected || saving}
            style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: "none", cursor: selected && !saving ? "pointer" : "not-allowed",
              background: selected && !saving ? "var(--kh-peach)" : "var(--kh-ink-200)",
              color: selected && !saving ? "#fff" : "var(--kh-ink-400)",
              display: "inline-flex", alignItems: "center", gap: 6,
              transition: "background 0.15s",
            }}
          >
            {saving && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
            {saving ? "Assigning…" : "Assign to class"}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
