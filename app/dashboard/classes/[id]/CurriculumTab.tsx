"use client"

import { useEffect, useState } from "react"
import { CalendarDays, ChevronDown, ChevronUp, Plus, Trash2, BookOpen } from "lucide-react"
import type { ClassCurriculumWithCreator } from "@/app/api/modules/class_curriculum/class_curriculum.types"
import type { ClassCurriculumItem } from "@/app/api/modules/class_curriculum_items/class_curriculum_items.types"

const PERIOD_TYPES = ["week", "month", "term"] as const
const LEARNING_DOMAINS = ["Motor skills", "Language", "Cognitive", "Social-emotional", "Creative arts"]
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const STATUS_TONE: Record<string, { bg: string; color: string; dot: string }> = {
  draft: { bg: "var(--kh-ink-50)", color: "var(--kh-ink-500)", dot: "var(--kh-ink-300)" },
  published: { bg: "var(--kh-sage-bg)", color: "var(--kh-sage-d)", dot: "var(--kh-sage)" },
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function NewPeriodForm({ classId, onCreated, onCancel }: { classId: string; onCreated: (p: ClassCurriculumWithCreator) => void; onCancel: () => void }) {
  const [periodType, setPeriodType] = useState<typeof PERIOD_TYPES[number]>("week")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [title, setTitle] = useState("")
  const [theme, setTheme] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function submit() {
    if (!start || !end) { setError("Start and end dates are required."); return }
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/classes/${classId}/curriculum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period_type: periodType,
          period_start: start,
          period_end: end,
          title: title.trim() || null,
          theme: theme.trim() || null,
        }),
      })
      if (res.ok) {
        const period: ClassCurriculumWithCreator = await res.json()
        onCreated(period)
      } else {
        const j = await res.json().catch(() => ({}))
        setError(j.error ?? "Failed to create curriculum period.")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="kh-card" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select value={periodType} onChange={(e) => setPeriodType(e.target.value as typeof PERIOD_TYPES[number])} style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "7px 10px", fontSize: 12.5 }}>
          {PERIOD_TYPES.map((t) => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
        </select>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, fontFamily: "var(--kh-font-mono)" }} />
        <span style={{ alignSelf: "center", color: "var(--kh-ink-400)", fontSize: 12 }}>–</span>
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, fontFamily: "var(--kh-font-mono)" }} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" style={{ flex: 1, minWidth: 160, border: "1px solid var(--kh-border)", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, outline: "none" }} />
        <input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Theme (optional)" style={{ flex: 1, minWidth: 160, border: "1px solid var(--kh-border)", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, outline: "none" }} />
      </div>
      {error && <span style={{ fontSize: 11.5, color: "#C0392B" }}>{error}</span>}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ fontSize: 12, padding: "6px 12px", border: "1px solid var(--kh-border)", borderRadius: 7, background: "none", cursor: "pointer", color: "var(--kh-ink-600)" }}>Cancel</button>
        <button onClick={submit} disabled={saving} style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", border: "none", borderRadius: 7, background: "var(--kh-peach)", color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Creating…" : "Create period"}
        </button>
      </div>
    </div>
  )
}

function AddCurriculumItemRow({ classId, curriculumId, onAdded }: { classId: string; curriculumId: string; onAdded: (item: ClassCurriculumItem) => void }) {
  const [open, setOpen] = useState(false)
  const [dateMode, setDateMode] = useState<"date" | "day">("day")
  const [specificDate, setSpecificDate] = useState("")
  const [dayOfWeek, setDayOfWeek] = useState(DAYS[0])
  const [activityName, setActivityName] = useState("")
  const [domain, setDomain] = useState(LEARNING_DOMAINS[0])
  const [materials, setMaterials] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function submit() {
    if (!activityName.trim()) { setError("Activity name is required."); return }
    if (dateMode === "date" && !specificDate) { setError("Pick a date."); return }
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/classes/${classId}/curriculum/${curriculumId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specific_date: dateMode === "date" ? specificDate : null,
          day_of_week: dateMode === "day" ? dayOfWeek : null,
          activity_name: activityName.trim(),
          learning_domain: domain,
          materials_needed: materials.trim() || null,
          description: description.trim() || null,
          sort_order: Date.now(),
        }),
      })
      if (res.ok) {
        const item: ClassCurriculumItem = await res.json()
        onAdded(item)
        setActivityName("")
        setMaterials("")
        setDescription("")
        setOpen(false)
      } else {
        const j = await res.json().catch(() => ({}))
        setError(j.error ?? "Failed to add activity.")
      }
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10, borderTop: "1px solid var(--kh-ink-50)", fontSize: 11.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", background: "none", border: "none", borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: "var(--kh-ink-50)", cursor: "pointer", width: "100%", textAlign: "left" }}
      >
        <Plus size={12} /> Add activity
      </button>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 10, borderTop: "1px solid var(--kh-ink-50)" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", border: "1px solid var(--kh-border)", borderRadius: 8, overflow: "hidden" }}>
          {(["day", "date"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setDateMode(m)}
              style={{ padding: "6px 10px", fontSize: 11.5, fontWeight: 600, border: "none", cursor: "pointer", background: dateMode === m ? "var(--kh-peach-bg)" : "var(--kh-bg)", color: dateMode === m ? "var(--kh-peach-d)" : "var(--kh-ink-500)" }}
            >
              {m === "day" ? "Recurring day" : "Specific date"}
            </button>
          ))}
        </div>
        {dateMode === "day" ? (
          <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "6px 8px", fontSize: 12 }}>
            {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        ) : (
          <input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "6px 8px", fontSize: 12, fontFamily: "var(--kh-font-mono)" }} />
        )}
      </div>
      <input
        autoFocus
        value={activityName}
        onChange={(e) => setActivityName(e.target.value)}
        placeholder="Activity name…"
        style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, outline: "none" }}
      />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select value={domain} onChange={(e) => setDomain(e.target.value)} style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "6px 8px", fontSize: 12 }}>
          {LEARNING_DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <input value={materials} onChange={(e) => setMaterials(e.target.value)} placeholder="Materials needed (optional)" style={{ flex: 1, minWidth: 160, border: "1px solid var(--kh-border)", borderRadius: 8, padding: "6px 10px", fontSize: 12, outline: "none" }} />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, outline: "none", resize: "vertical", fontFamily: "inherit" }}
      />
      {error && <span style={{ fontSize: 11.5, color: "#C0392B" }}>{error}</span>}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={() => setOpen(false)} style={{ fontSize: 12, padding: "5px 10px", border: "1px solid var(--kh-border)", borderRadius: 7, background: "none", cursor: "pointer", color: "var(--kh-ink-600)" }}>Cancel</button>
        <button onClick={submit} disabled={saving || !activityName.trim()} style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", border: "none", borderRadius: 7, background: "var(--kh-peach)", color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Adding…" : "Add"}
        </button>
      </div>
    </div>
  )
}

function PeriodCard({
  classId,
  period,
  expanded,
  items,
  onToggle,
  onDeleted,
  onStatusChanged,
  onItemAdded,
  onItemDeleted,
}: {
  classId: string
  period: ClassCurriculumWithCreator
  expanded: boolean
  items: ClassCurriculumItem[] | undefined
  onToggle: () => void
  onDeleted: (id: string) => void
  onStatusChanged: (p: ClassCurriculumWithCreator) => void
  onItemAdded: (curriculumId: string, item: ClassCurriculumItem) => void
  onItemDeleted: (curriculumId: string, itemId: string) => void
}) {
  const [deleting, setDeleting] = useState(false)
  const tone = STATUS_TONE[period.status] ?? STATUS_TONE.draft

  async function handleDelete() {
    if (!confirm("Delete this curriculum period and all its activities?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/classes/${classId}/curriculum/${period.id}`, { method: "DELETE" })
      if (res.ok) onDeleted(period.id)
    } finally {
      setDeleting(false)
    }
  }

  async function toggleStatus() {
    const nextStatus = period.status === "published" ? "draft" : "published"
    const res = await fetch(`/api/classes/${classId}/curriculum/${period.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    })
    if (res.ok) onStatusChanged(await res.json())
  }

  async function deleteItem(itemId: string) {
    const res = await fetch(`/api/classes/${classId}/curriculum/${period.id}/items/${itemId}`, { method: "DELETE" })
    if (res.ok) onItemDeleted(period.id, itemId)
  }

  return (
    <div className="kh-card">
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", flexWrap: "wrap" }}>
        <button onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--kh-ink-400)", display: "flex" }}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--kh-ink-500)", background: "var(--kh-ink-50)", borderRadius: 999, padding: "2px 8px", textTransform: "capitalize" }}>{period.period_type}</span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--kh-ink-900)" }}>{period.title || `${fmtDate(period.period_start)} – ${fmtDate(period.period_end)}`}</span>
        <span style={{ fontSize: 11.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>{fmtDate(period.period_start)} – {fmtDate(period.period_end)}</span>
        {period.theme && <span style={{ fontSize: 11.5, color: "var(--kh-peach-d)" }}>{period.theme}</span>}
        <div style={{ flex: 1 }} />
        <button
          onClick={toggleStatus}
          title="Toggle status"
          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 999, fontSize: 11.5, fontWeight: 500, background: tone.bg, color: tone.color, border: "none", cursor: "pointer", textTransform: "capitalize" }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: tone.dot }} /> {period.status}
        </button>
        <span style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>{period.created_by_name ?? "Unknown"}</span>
        <button onClick={handleDelete} disabled={deleting} title="Delete period" style={{ background: "none", border: "none", color: "var(--kh-ink-300)", cursor: deleting ? "not-allowed" : "pointer", display: "flex" }}>
          <Trash2 size={13} />
        </button>
      </div>

      {expanded && (
        <div style={{ padding: "2px 16px 14px", borderTop: "1px solid var(--kh-ink-100)" }}>
          {items === undefined ? (
            <p style={{ fontSize: 12.5, color: "var(--kh-ink-400)", padding: "14px 0" }}>Loading activities…</p>
          ) : items.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "var(--kh-ink-400)", padding: "14px 0" }}>No activities planned yet.</p>
          ) : (
            items.map((item, i) => (
              <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid var(--kh-ink-50)" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--kh-ink-500)", fontFamily: "var(--kh-font-mono)", width: 70, flexShrink: 0, marginTop: 2 }}>
                  {item.day_of_week ?? (item.specific_date ? fmtDate(item.specific_date) : "—")}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>{item.activity_name}</span>
                    {item.learning_domain && (
                      <span style={{ fontSize: 10.5, fontWeight: 500, color: "var(--kh-sky-d, #3A6B8A)", background: "var(--kh-sky-bg, #E8F2F8)", borderRadius: 999, padding: "2px 7px" }}>{item.learning_domain}</span>
                    )}
                  </div>
                  {item.description && <div style={{ fontSize: 12, color: "var(--kh-ink-600)", marginTop: 3 }}>{item.description}</div>}
                  {item.materials_needed && <div style={{ fontSize: 11, color: "var(--kh-ink-400)", marginTop: 3 }}>Materials: {item.materials_needed}</div>}
                </div>
                <button onClick={() => deleteItem(item.id)} title="Remove activity" style={{ background: "none", border: "none", color: "var(--kh-ink-300)", cursor: "pointer", display: "flex", marginTop: 2 }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
          <AddCurriculumItemRow classId={classId} curriculumId={period.id} onAdded={(item) => onItemAdded(period.id, item)} />
        </div>
      )}
    </div>
  )
}

export default function CurriculumTab({ classId }: { classId: string }) {
  const [periods, setPeriods] = useState<ClassCurriculumWithCreator[] | null>(null)
  const [itemsByPeriod, setItemsByPeriod] = useState<Record<string, ClassCurriculumItem[]>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded) return
    setLoaded(true)
    fetch(`/api/classes/${classId}/curriculum`)
      .then((r) => r.json())
      .then((data) => setPeriods(Array.isArray(data) ? data : []))
  }, [classId, loaded])

  async function toggleExpand(period: ClassCurriculumWithCreator) {
    const next = expandedId === period.id ? null : period.id
    setExpandedId(next)
    if (next && !(period.id in itemsByPeriod)) {
      const res = await fetch(`/api/classes/${classId}/curriculum/${period.id}/items`)
      const data = await res.json()
      setItemsByPeriod((prev) => ({ ...prev, [period.id]: Array.isArray(data) ? data : [] }))
    }
  }

  if (periods === null) {
    return <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>Loading…</div>
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 820 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <BookOpen size={15} style={{ color: "var(--kh-peach)" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Curriculum plans</span>
        <div style={{ flex: 1 }} />
        {!showNewForm && (
          <button
            onClick={() => setShowNewForm(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 7, fontSize: 12, fontWeight: 600, border: "1px solid var(--kh-border)", background: "var(--kh-bg)", color: "var(--kh-ink-600)", cursor: "pointer" }}
          >
            <Plus size={12} /> New period
          </button>
        )}
      </div>

      {showNewForm && (
        <NewPeriodForm
          classId={classId}
          onCancel={() => setShowNewForm(false)}
          onCreated={(p) => {
            setPeriods((prev) => [p, ...(prev ?? [])])
            setShowNewForm(false)
          }}
        />
      )}

      {periods.length === 0 ? (
        <div className="kh-card" style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 18, color: "var(--kh-ink-700)", marginBottom: 6 }}>
            <CalendarDays size={18} style={{ display: "inline", marginRight: 6, color: "var(--kh-ink-400)" }} />
            No curriculum plans yet
          </div>
          <div style={{ fontSize: 13, color: "var(--kh-ink-400)" }}>
            Create a weekly, monthly, or term plan to start scheduling activities.
          </div>
        </div>
      ) : (
        periods.map((period) => (
          <PeriodCard
            key={period.id}
            classId={classId}
            period={period}
            expanded={expandedId === period.id}
            items={itemsByPeriod[period.id]}
            onToggle={() => toggleExpand(period)}
            onDeleted={(id) => {
              setPeriods((prev) => (prev ?? []).filter((p) => p.id !== id))
              setItemsByPeriod((prev) => { const next = { ...prev }; delete next[id]; return next })
            }}
            onStatusChanged={(updated) => setPeriods((prev) => (prev ?? []).map((p) => (p.id === updated.id ? updated : p)))}
            onItemAdded={(curriculumId, item) => setItemsByPeriod((prev) => ({ ...prev, [curriculumId]: [...(prev[curriculumId] ?? []), item] }))}
            onItemDeleted={(curriculumId, itemId) => setItemsByPeriod((prev) => ({ ...prev, [curriculumId]: (prev[curriculumId] ?? []).filter((i) => i.id !== itemId) }))}
          />
        ))
      )}
    </div>
  )
}
