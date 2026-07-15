"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Spinner } from "@/components/ui/Spinner"

export function DeleteSupplyButton({ supplyId, onDeleted }: { supplyId: string; onDeleted: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm("Delete this receipt? This can't be undone.")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/food-supplies/${supplyId}`, { method: "DELETE" })
      if (res.ok) onDeleted(supplyId)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      title="Delete receipt"
      style={{ background: "none", border: "none", color: "var(--kh-ink-400)", cursor: deleting ? "not-allowed" : "pointer", display: "flex" }}
    >
      {deleting ? <Spinner size="sm" /> : <Trash2 size={14} />}
    </button>
  )
}
