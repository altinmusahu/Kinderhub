"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import type { ClassChecklistItem } from "@/app/api/modules/class_checklist_items/class_checklist_items.types"
import type { KidChecklistProgress } from "@/app/api/modules/family_checklist_progress/family_checklist_progress.types"
import { Spinner } from "@/components/ui/Spinner"

const CATEGORY_TONE: Record<string, string> = {
  Documents: "var(--kh-sage)",
  Supplies: "var(--kh-marigold)",
  Comfort: "var(--kh-pink)",
}

function categoryTone(cat: string) {
  return CATEGORY_TONE[cat] ?? "var(--kh-sky)"
}

const DEFAULT_CATEGORIES = ["Documents", "Supplies", "Comfort"]

function AddItemRow({
  classId,
  category,
  existingCategories,
  onAdded,
}: {
  classId: string
  category?: string
  existingCategories: string[]
  onAdded: (item: ClassChecklistItem) => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [cat, setCat] = useState(category ?? "")
  const [customCat, setCustomCat] = useState("")
  const [appliesTo, setAppliesTo] = useState("All children")
  const [mandatory, setMandatory] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const categoryOptions = [...new Set([...DEFAULT_CATEGORIES, ...existingCategories])]
  const needsCategoryPicker = !category

  async function submit() {
    const finalCategory = needsCategoryPicker ? (cat === "__custom__" ? customCat.trim() : cat) : category!
    if (!name.trim()) { setError("Item name is required."); return }
    if (!finalCategory) { setError("Category is required."); return }
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/classes/${classId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: finalCategory, item_name: name.trim(), applies_to: appliesTo, is_mandatory: mandatory, sort_order: Date.now() }),
      })
      if (res.ok) {
        const item: ClassChecklistItem = await res.json()
        onAdded(item)
        setName("")
        setCustomCat("")
        setOpen(false)
      } else {
        const j = await res.json().catch(() => ({}))
        setError(j.error ?? "Failed to add item.")
      }
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); if (needsCategoryPicker && !cat) setCat(categoryOptions[0] ?? "__custom__") }}
        style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10, borderTop: "1px solid var(--kh-ink-50)", fontSize: 11.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", background: "none", border: "none", borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: "var(--kh-ink-50)", cursor: "pointer", width: "100%", textAlign: "left" }}
      >
        <Plus size={12} /> {category ? `Add item to ${category.toLowerCase()}` : "Add checklist item"}
      </button>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 10, borderTop: "1px solid var(--kh-ink-50)" }}>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Item name…"
        style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, outline: "none" }}
      />
      {needsCategoryPicker && (
        <div style={{ display: "flex", gap: 8 }}>
          <select value={cat} onChange={(e) => setCat(e.target.value)} style={{ flex: 1, border: "1px solid var(--kh-border)", borderRadius: 8, padding: "6px 8px", fontSize: 12 }}>
            {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            <option value="__custom__">Custom…</option>
          </select>
          {cat === "__custom__" && (
            <input
              value={customCat}
              onChange={(e) => setCustomCat(e.target.value)}
              placeholder="New category name…"
              style={{ flex: 1, border: "1px solid var(--kh-border)", borderRadius: 8, padding: "6px 8px", fontSize: 12, outline: "none" }}
            />
          )}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <select value={appliesTo} onChange={(e) => setAppliesTo(e.target.value)} style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "6px 8px", fontSize: 12 }}>
          <option>All children</option>
          <option>Not potty-trained</option>
          <option>With allergies</option>
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--kh-ink-600)" }}>
          <input type="checkbox" checked={mandatory} onChange={(e) => setMandatory(e.target.checked)} /> Mandatory
        </label>
        <div style={{ flex: 1 }} />
        <button onClick={() => setOpen(false)} style={{ fontSize: 12, padding: "5px 10px", border: "1px solid var(--kh-border)", borderRadius: 7, background: "none", cursor: "pointer", color: "var(--kh-ink-600)" }}>Cancel</button>
        <button onClick={submit} disabled={saving || !name.trim()} style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", border: "none", borderRadius: 7, background: "var(--kh-peach)", color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Adding…" : "Add"}
        </button>
      </div>
      {error && <span style={{ fontSize: 11.5, color: "#C0392B" }}>{error}</span>}
    </div>
  )
}

export default function ChecklistTab({ classId }: { classId: string }) {
  const [items, setItems] = useState<ClassChecklistItem[] | null>(null)
  const [progress, setProgress] = useState<KidChecklistProgress[]>([])
  const [loaded, setLoaded] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (loaded) return
    setLoaded(true)
    Promise.all([
      fetch(`/api/classes/${classId}/checklist`).then((r) => r.json()),
      fetch(`/api/classes/${classId}/checklist/progress`).then((r) => r.json()),
    ]).then(([itemsData, progressData]) => {
      setItems(Array.isArray(itemsData) ? itemsData : [])
      setProgress(Array.isArray(progressData) ? progressData : [])
    })
  }, [classId, loaded])

  async function deleteItem(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/classes/${classId}/checklist/${id}`, { method: "DELETE" })
      if (res.ok) setItems((prev) => (prev ?? []).filter((i) => i.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  if (items === null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "32px 0", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>
        <Spinner size="md" />
        Loading…
      </div>
    )
  }

  const categories = [...new Set(items.map((i) => i.category))]
  const total = items.length
  const mandatoryCount = items.filter((i) => i.is_mandatory).length
  const incompleteProgress = progress.filter((p) => p.of > 0 && p.done < p.of)

  return (
    <div className="kh-tab-split-grid">
      {/* LEFT — checklist builder */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {categories.length === 0 ? (
          <div className="kh-card" style={{ padding: "24px 16px" }}>
            <p style={{ fontSize: 13, color: "var(--kh-ink-400)", textAlign: "center", margin: "0 0 4px" }}>
              No checklist items yet.
            </p>
            <AddItemRow classId={classId} existingCategories={categories} onAdded={(item) => setItems((prev) => [...(prev ?? []), item])} />
          </div>
        ) : (
          <div className="kh-card" style={{ padding: "12px 16px" }}>
            <AddItemRow classId={classId} existingCategories={categories} onAdded={(item) => setItems((prev) => [...(prev ?? []), item])} />
          </div>
        )}
        {categories.map((cat) => {
            const rows = items.filter((i) => i.category === cat)
            return (
              <div key={cat} className="kh-card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--kh-ink-100)" }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: categoryTone(cat) }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>{cat}</span>
                  <span style={{ fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>{rows.length} items</span>
                </div>
                <div style={{ padding: "2px 16px 12px" }}>
                  {rows.map((r, i) => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i === 0 ? "none" : "1px solid var(--kh-ink-50)" }}>
                      <div style={{ flex: 1, fontSize: 13, color: "var(--kh-ink-800)" }}>{r.item_name}</div>
                      <span style={{ fontSize: 11, fontWeight: 500, color: "var(--kh-ink-600)", background: "var(--kh-ink-50)", borderRadius: 999, padding: "2px 8px" }}>{r.applies_to}</span>
                      {r.is_mandatory ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: "#C0392B", background: "#FDEAEA", borderRadius: 999, padding: "2px 8px" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C0392B" }} /> Mandatory
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--kh-ink-400)", background: "var(--kh-ink-50)", borderRadius: 999, padding: "2px 8px" }}>Optional</span>
                      )}
                      <button onClick={() => deleteItem(r.id)} disabled={deletingId === r.id} title="Remove item" style={{ background: "none", border: "none", color: "var(--kh-ink-300)", cursor: deletingId === r.id ? "not-allowed" : "pointer", display: "flex" }}>
                        {deletingId === r.id ? <Spinner size="sm" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  ))}
                  <AddItemRow classId={classId} category={cat} existingCategories={categories} onAdded={(item) => setItems((prev) => [...(prev ?? []), item])} />
                </div>
              </div>
            )
          })}
        <div style={{ fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", padding: "0 4px" }}>
          Parents see this list in the app once enrollment is confirmed · mandatory items block first check-in
        </div>
      </div>

      {/* RIGHT — family progress */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="kh-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--kh-ink-100)" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Needs attention</span>
            <span style={{ fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>{mandatoryCount} mandatory · {total} total</span>
          </div>
          <div style={{ padding: "2px 16px 14px" }}>
            {incompleteProgress.length === 0 ? (
              <p style={{ fontSize: 12.5, color: "var(--kh-ink-400)", padding: "12px 0" }}>
                {progress.length === 0 ? "No children enrolled in this class yet." : "Everyone's checklist is complete. See the Progress tab for the full picture."}
              </p>
            ) : (
              incompleteProgress.map((p, i) => {
                const pct = p.of > 0 ? Math.round((p.done / p.of) * 100) : 100
                return (
                  <div key={p.kid_id} style={{ padding: "11px 0", borderTop: i === 0 ? "none" : "1px solid var(--kh-ink-50)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 7, background: "var(--kh-peach-bg)", color: "var(--kh-peach-d)", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                        {p.kid_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--kh-ink-900)" }}>{p.kid_name}</div>
                      </div>
                      <span style={{ fontSize: 11.5, color: "var(--kh-ink-600)", fontFamily: "var(--kh-font-mono)" }}>{p.done}/{p.of}</span>
                    </div>
                    <div style={{ height: 6, background: "var(--kh-ink-50)", borderRadius: 999, overflow: "hidden", border: "1px solid var(--kh-ink-100)", marginTop: 8 }}>
                      <div style={{ width: pct + "%", height: "100%", background: "var(--kh-peach)" }} />
                    </div>
                    {p.missing.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                        {p.missing.map((m) => (
                          <span key={m} style={{ fontSize: 10.5, fontWeight: 500, color: "#B07A1A", background: "#FEF3E2", borderRadius: 999, padding: "2px 8px" }}>{m}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="kh-card">
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--kh-ink-100)" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Applies-to groups</span>
          </div>
          <div style={{ padding: "12px 16px 14px", display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: "var(--kh-ink-700)" }}>
            {[["All children", "every child in this class"], ["Not potty-trained", "flag on child profile"], ["With allergies", "has allergy record"]].map(([k, v], i) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: i === 0 ? 0 : 8, borderTop: i === 0 ? "none" : "1px solid var(--kh-ink-50)" }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: "var(--kh-ink-600)", background: "var(--kh-ink-50)", borderRadius: 999, padding: "2px 8px" }}>{k}</span>
                <span style={{ color: "var(--kh-ink-400)", fontSize: 11.5 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
