"use client"

import { useEffect, useState } from "react"
import { Printer, Users } from "lucide-react"
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

  const activeClass = classes.find(c => c.id === activeClassId)
  const days = cells ? Array.from(new Set(cells.map(c => c.date))) : []

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
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
          <button type="button" className="kh-btn" onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Printer size={13} /> Print week
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
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
        <div className="kh-card" style={{ overflow: "hidden" }}>
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
          <div style={{ padding: "10px 18px", borderTop: "1px solid var(--kh-ink-100)", fontSize: 11.5, color: "var(--kh-ink-400)" }}>
            Menus are drafted for this week — click any cell to edit.
            {lastEdited && <span> Last edited by {lastEdited.name} · today, {lastEdited.at}</span>}
          </div>
        </div>
      )}
    </>
  )
}
