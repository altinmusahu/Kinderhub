"use client"

import { useEffect, useState } from "react"
import type { KidChecklistDetail } from "@/app/api/modules/family_checklist_progress/family_checklist_progress.types"

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
}

export default function ProgressTab({ classId }: { classId: string }) {
  const [kids, setKids] = useState<KidChecklistDetail[] | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [pending, setPending] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (loaded) return
    setLoaded(true)
    fetch(`/api/classes/${classId}/checklist/progress/detail`)
      .then((r) => r.json())
      .then((data) => setKids(Array.isArray(data) ? data : []))
  }, [classId, loaded])

  async function toggle(kidId: string, checklistItemId: string, nextChecked: boolean) {
    const key = `${kidId}:${checklistItemId}`
    setPending((prev) => new Set(prev).add(key))

    // optimistic update
    setKids((prev) =>
      (prev ?? []).map((k) =>
        k.kid_id !== kidId
          ? k
          : { ...k, items: k.items.map((i) => (i.checklist_item_id === checklistItemId ? { ...i, is_checked: nextChecked } : i)) }
      )
    )

    try {
      const res = await fetch(`/api/classes/${classId}/checklist/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kid_id: kidId, checklist_item_id: checklistItemId, is_checked: nextChecked }),
      })
      if (!res.ok) {
        // revert on failure
        setKids((prev) =>
          (prev ?? []).map((k) =>
            k.kid_id !== kidId
              ? k
              : { ...k, items: k.items.map((i) => (i.checklist_item_id === checklistItemId ? { ...i, is_checked: !nextChecked } : i)) }
          )
        )
      }
    } finally {
      setPending((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  if (kids === null) {
    return <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>Loading…</div>
  }

  if (kids.length === 0) {
    return (
      <div className="kh-card" style={{ padding: "32px 16px", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>
        No children enrolled, or no checklist items set up for this class yet.
      </div>
    )
  }

  return (
    <div className="kh-progress-grid">
      {kids.map((kid) => {
        const done = kid.items.filter((i) => i.is_checked).length
        const total = kid.items.length
        const ready = total > 0 && done === total
        return (
          <div key={kid.kid_id} className="kh-card">
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--kh-ink-100)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 8, background: "var(--kh-peach-bg)", color: "var(--kh-peach-d)", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {initials(kid.kid_name)}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-900)", flex: 1 }}>{kid.kid_name}</span>
              {ready ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: "#3A8C50", background: "#E8F5EC", borderRadius: 999, padding: "2px 8px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3A8C50" }} /> Ready
                </span>
              ) : (
                <span style={{ fontSize: 11.5, color: "var(--kh-ink-600)", fontFamily: "var(--kh-font-mono)" }}>{done}/{total}</span>
              )}
            </div>
            <div style={{ padding: "4px 16px 12px" }}>
              {kid.items.map((item, i) => {
                const key = `${kid.kid_id}:${item.checklist_item_id}`
                const isPending = pending.has(key)
                return (
                  <label
                    key={item.checklist_item_id}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i === 0 ? "none" : "1px solid var(--kh-ink-50)", cursor: isPending ? "wait" : "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={item.is_checked}
                      disabled={isPending}
                      onChange={(e) => toggle(kid.kid_id, item.checklist_item_id, e.target.checked)}
                    />
                    <span style={{ flex: 1, fontSize: 12.5, color: item.is_checked ? "var(--kh-ink-500)" : "var(--kh-ink-800)", textDecoration: item.is_checked ? "line-through" : "none" }}>
                      {item.item_name}
                    </span>
                    {item.is_mandatory && (
                      <span style={{ fontSize: 10, fontWeight: 500, color: "#C0392B", background: "#FDEAEA", borderRadius: 999, padding: "1px 7px" }}>Mandatory</span>
                    )}
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
