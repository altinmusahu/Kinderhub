"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Search, Loader2, Check } from "lucide-react"

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
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/kids")
      .then((r) => r.json())
      .then((data: Kid[]) => { setKids(data); setFiltered(data) })
      .catch(() => setError("Failed to load children."))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = query.toLowerCase()
    setFiltered(q ? kids.filter((k) => `${k.firstname} ${k.lastname}`.toLowerCase().includes(q)) : kids)
  }, [query, kids])

  function toggleKid(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleAssign = useCallback(async () => {
    if (selected.size === 0) return
    setSaving(true)
    setError(null)
    try {
      const results = await Promise.all(
        [...selected].map(kid_id =>
          fetch(`/api/kids/${classId}/kids/${kid_id}`, { method: "PUT" })
        )
      )
      const failed = results.filter(r => !r.ok)
      if (failed.length > 0) throw new Error(`${failed.length} assignment(s) failed.`)
      onSuccess()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
    } finally {
      setSaving(false)
    }
  }, [selected, classId, onSuccess, onClose])

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(42,32,24,0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: "var(--kh-surface)", borderRadius: 18, width: "100%", maxWidth: 440, boxShadow: "0 24px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", borderBottom: "1px solid var(--kh-ink-100)" }}>
          <div>
            <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 20, color: "var(--kh-ink-900)", fontWeight: 400 }}>Add children to class</div>
            <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginTop: 2 }}>Select one or more children to assign.</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--kh-ink-100)", background: "var(--kh-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-ink-500)" }}>
            <X size={14} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "14px 20px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--kh-ink-200)", borderRadius: 10, padding: "8px 12px", background: "var(--kh-bg)" }}>
            <Search size={13} style={{ color: "var(--kh-ink-400)", flexShrink: 0 }} />
            <input
              autoFocus
              type="text"
              placeholder="Search by name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: "var(--kh-ink-800)", width: "100%" }}
            />
          </div>
        </div>

        {/* Selected count badge */}
        {selected.size > 0 && (
          <div style={{ margin: "0 20px 6px", padding: "6px 12px", background: "var(--kh-peach-bg)", borderRadius: 8, fontSize: 12, color: "var(--kh-peach-d)", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>{selected.size} {selected.size === 1 ? "child" : "children"} selected</span>
            <button onClick={() => setSelected(new Set())} style={{ background: "none", border: "none", fontSize: 11, color: "var(--kh-peach-d)", cursor: "pointer", fontWeight: 600, padding: 0 }}>Clear all</button>
          </div>
        )}

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
              const isSelected = selected.has(kid.id)
              return (
                <button
                  key={kid.id}
                  onClick={() => toggleKid(kid.id)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: isSelected ? "var(--kh-peach-bg)" : "transparent", outline: isSelected ? "2px solid var(--kh-peach)" : "none", outlineOffset: -1, marginBottom: 3, textAlign: "left", transition: "background 0.1s" }}
                >
                  {/* Checkbox */}
                  <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: `2px solid ${isSelected ? "var(--kh-peach)" : "var(--kh-ink-300)"}`, background: isSelected ? "var(--kh-peach)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.1s" }}>
                    {isSelected && <Check size={11} color="#fff" strokeWidth={3} />}
                  </div>
                  {/* Avatar */}
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: isSelected ? "var(--kh-peach)" : "var(--kh-peach-bg)", color: isSelected ? "#fff" : "var(--kh-peach-d)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--kh-font-mono)", fontSize: 12, fontWeight: 700 }}>
                    {kid.firstname[0]}{kid.lastname[0]}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--kh-ink-800)" }}>
                    {kid.firstname} {kid.lastname}
                  </span>
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
        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--kh-ink-100)", display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "1px solid var(--kh-ink-200)", background: "var(--kh-bg)", color: "var(--kh-ink-700)", cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={selected.size === 0 || saving}
            style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: selected.size > 0 && !saving ? "pointer" : "not-allowed", background: selected.size > 0 && !saving ? "var(--kh-peach)" : "var(--kh-ink-200)", color: selected.size > 0 && !saving ? "#fff" : "var(--kh-ink-400)", display: "inline-flex", alignItems: "center", gap: 6, transition: "background 0.15s" }}
          >
            {saving && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
            {saving ? "Assigning…" : selected.size > 0 ? `Assign ${selected.size} ${selected.size === 1 ? "child" : "children"}` : "Assign to class"}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
