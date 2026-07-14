"use client"

import { useEffect, useState } from "react"
import { Printer, Users, Copy, X, Check } from "lucide-react"
import { Spinner } from "@/components/ui/Spinner"
import type { ClassMenuCell, MealType } from "@/app/api/modules/class_menus/class_menus.types"

type ClassLight = { id: string; name: string }

const MEAL_TONE: Record<MealType, { bg: string; color: string; label: string }> = {
  breakfast: { bg: "var(--kh-marigold-bg)", color: "var(--kh-marigold-d)", label: "Breakfast" },
  snack: { bg: "var(--kh-sage-bg)", color: "var(--kh-sage-d)", label: "Snack" },
  lunch: { bg: "var(--kh-peach-bg)", color: "var(--kh-peach-d)", label: "Lunch" },
}
const MEAL_ORDER: MealType[] = ["breakfast", "snack", "lunch"]

function mondayOf(d: Date): string {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  return monday.toISOString().split("T")[0]
}

function fmtDayHeader(iso: string): { weekday: string; num: string } {
  const d = new Date(iso + "T00:00:00")
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    num: d.getDate().toString(),
  }
}

export default function ClassMenusPage() {
  const [classes, setClasses] = useState<ClassLight[]>([])
  const [activeClassId, setActiveClassId] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()))
  const [cells, setCells] = useState<ClassMenuCell[] | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [saving, setSaving] = useState<string | null>(null)
  const [lastEdited, setLastEdited] = useState<{ name: string; at: string } | null>(null)
  const [copyOpen, setCopyOpen] = useState(false)
  const [copySourceId, setCopySourceId] = useState("")
  const [copying, setCopying] = useState(false)
  const [copyError, setCopyError] = useState("")

  useEffect(() => {
    fetch("/api/classes/light")
      .then(r => r.json())
      .then((data: ClassLight[]) => {
        setClasses(Array.isArray(data) ? data : [])
        if (Array.isArray(data) && data.length > 0) setActiveClassId(data[0].id)
      })
  }, [])

  useEffect(() => {
    if (!activeClassId) return
    setCells(null)
    fetch(`/api/classes/${activeClassId}/menus?week=${weekStart}`)
      .then(r => r.json())
      .then(d => setCells(d.cells))
  }, [activeClassId, weekStart])

  function cellKey(date: string, mealType: MealType) {
    return `${date}_${mealType}`
  }

  function startEdit(cell: ClassMenuCell) {
    setEditingKey(cellKey(cell.date, cell.meal_type))
    setDraft(cell.description ?? "")
  }

  async function commitEdit(cell: ClassMenuCell) {
    const key = cellKey(cell.date, cell.meal_type)
    setEditingKey(null)
    if (draft.trim() === (cell.description ?? "")) return

    setSaving(key)
    try {
      const res = await fetch(`/api/classes/${activeClassId}/menus`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: cell.date, meal_type: cell.meal_type, description: draft.trim() }),
      })
      if (res.ok) {
        const saved = await res.json()
        setCells(prev => (prev ?? []).map(c =>
          c.date === cell.date && c.meal_type === cell.meal_type
            ? { ...c, description: saved.description, id: saved.id, created_by_name: saved.created_by_name }
            : c
        ))
        if (saved.created_by_name) {
          setLastEdited({ name: saved.created_by_name, at: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) })
        }
      }
    } finally {
      setSaving(null)
    }
  }

  function openCopyModal() {
    setCopyError("")
    setCopySourceId("")
    setCopyOpen(true)
  }

  async function handleCopy() {
    if (!copySourceId || !activeClassId) return
    setCopying(true)
    setCopyError("")
    try {
      const res = await fetch(`/api/classes/${activeClassId}/menus/copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_class_id: copySourceId, week: weekStart }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? "Failed to copy menu.")
      }
      const data = await res.json()
      setCells(data.cells)
      setCopyOpen(false)
    } catch (err) {
      setCopyError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setCopying(false)
    }
  }

  const activeClass = classes.find(c => c.id === activeClassId)
  const copySourceOptions = classes.filter(c => c.id !== activeClassId)
  const days = cells ? Array.from(new Set(cells.map(c => c.date))) : []

  return (
    <>
      <div className="no-print" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 className="kh-h1">Class menus</h1>
          <p className="kh-sub" style={{ margin: "4px 0 0" }}>
            Week of {new Date(weekStart + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} · published menus show up in each family&apos;s app
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
          {activeClass && (
            <span className="kh-status-badge" style={{ background: "var(--kh-sage-bg)", color: "var(--kh-sage-d)" }}>
              <Users size={11} /> Visible to families in {activeClass.name}
            </span>
          )}
          <button type="button" className="kh-btn" onClick={openCopyModal} style={{ display: "inline-flex", alignItems: "center", gap: 6 }} disabled={classes.length < 2}>
            <Copy size={13} /> Copy from another class
          </button>
          <button type="button" className="kh-btn" onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Printer size={13} /> Print week
          </button>
        </div>
      </div>

      <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {classes.map(c => {
          const active = c.id === activeClassId
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveClassId(c.id)}
              style={{
                padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
                background: active ? "var(--kh-ink-900)" : "var(--kh-ink-50)",
                color: active ? "#fff" : "var(--kh-ink-600)",
              }}
            >
              {c.name}
            </button>
          )
        })}
      </div>

      {!cells ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="kh-card kh-print-area" style={{ overflow: "hidden" }}>
          <div className="kh-print-only" style={{ padding: "16px 18px 0" }}>
            <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 20, color: "var(--kh-ink-900)" }}>
              {activeClass?.name} — Week of {new Date(weekStart + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          </div>
          <div className="kh-table-scroll">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ width: 90 }} />
                  {days.map(date => {
                    const { weekday, num } = fmtDayHeader(date)
                    return (
                      <th key={date} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--kh-ink-500)", borderBottom: "1px solid var(--kh-ink-100)" }}>
                        {weekday} {num}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {MEAL_ORDER.map(mealType => (
                  <tr key={mealType} style={{ borderTop: "1px solid var(--kh-ink-50)" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <span className="kh-status-badge" style={{ background: MEAL_TONE[mealType].bg, color: MEAL_TONE[mealType].color, fontSize: 11 }}>
                        {MEAL_TONE[mealType].label}
                      </span>
                    </td>
                    {days.map(date => {
                      const cell = cells.find(c => c.date === date && c.meal_type === mealType)!
                      const key = cellKey(date, mealType)
                      const isEditing = editingKey === key
                      return (
                        <td key={date} style={{ padding: "6px 8px", verticalAlign: "top", minWidth: 150 }}>
                          {isEditing ? (
                            <textarea
                              autoFocus
                              value={draft}
                              onChange={e => setDraft(e.target.value)}
                              onBlur={() => commitEdit(cell)}
                              rows={2}
                              style={{
                                width: "100%", border: "1px solid var(--kh-peach)", borderRadius: 8,
                                padding: "6px 8px", fontSize: 12.5, resize: "vertical", outline: "none", fontFamily: "inherit",
                              }}
                            />
                          ) : (
                            <div
                              onClick={() => startEdit(cell)}
                              style={{
                                padding: "6px 8px", borderRadius: 8, fontSize: 12.5, cursor: "pointer", minHeight: 36,
                                color: cell.description ? "var(--kh-ink-800)" : "var(--kh-ink-300)",
                                display: "flex", alignItems: "center", gap: 6,
                              }}
                            >
                              {saving === key && <Spinner size="sm" />}
                              {cell.description || "Add dish…"}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="no-print" style={{ padding: "10px 18px", borderTop: "1px solid var(--kh-ink-100)", fontSize: 11.5, color: "var(--kh-ink-400)" }}>
            Menus are drafted for this week — click any cell to edit.
            {lastEdited && <span> Last edited by {lastEdited.name} · today, {lastEdited.at}</span>}
          </div>
        </div>
      )}

      {copyOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(42,32,24,0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setCopyOpen(false) }}
        >
          <div className="kh-modal-dialog" style={{ background: "var(--kh-surface)", borderRadius: 18, width: "100%", maxWidth: 420, boxShadow: "0 24px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--kh-ink-100)" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--kh-sage-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-sage-d)", flexShrink: 0 }}>
                <Copy size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 18, color: "var(--kh-ink-900)" }}>Copy menu to {activeClass?.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginTop: 1 }}>Choose a class to copy this week&apos;s menu from</div>
              </div>
              <button type="button" onClick={() => setCopyOpen(false)} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--kh-ink-100)", background: "var(--kh-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-ink-500)", flexShrink: 0 }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>Copy from</label>
                <select
                  value={copySourceId}
                  onChange={e => setCopySourceId(e.target.value)}
                  style={{ width: "100%", border: "1px solid var(--kh-border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "var(--kh-paper)", color: "var(--kh-ink-800)", outline: "none" }}
                >
                  <option value="">Select a class…</option>
                  {copySourceOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ padding: "9px 12px", borderRadius: 9, background: "var(--kh-marigold-bg)", fontSize: 12, color: "var(--kh-marigold-d)" }}>
                This replaces every dish already set for {activeClass?.name} this week with the menu from the class you pick. This can&apos;t be undone.
              </div>

              {copyError && (
                <div style={{ padding: "8px 12px", background: "var(--kh-pink-bg)", borderRadius: 8, fontSize: 12, color: "var(--kh-pink-d)" }}>
                  {copyError}
                </div>
              )}
            </div>

            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--kh-ink-100)", display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setCopyOpen(false)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "1px solid var(--kh-ink-200)", background: "var(--kh-bg)", color: "var(--kh-ink-700)", cursor: "pointer" }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!copySourceId || copying}
                style={{
                  padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none",
                  cursor: (!copySourceId || copying) ? "not-allowed" : "pointer",
                  background: (!copySourceId || copying) ? "var(--kh-ink-200)" : "var(--kh-peach)",
                  color: (!copySourceId || copying) ? "var(--kh-ink-400)" : "#fff",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}
              >
                {copying ? <Spinner size="sm" /> : <Check size={13} />}
                {copying ? "Copying…" : "Copy menu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
