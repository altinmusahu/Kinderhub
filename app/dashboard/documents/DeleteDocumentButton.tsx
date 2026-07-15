"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Spinner } from "@/components/ui/Spinner"

export default function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm("Delete this document?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/documents/${documentId}`, { method: "DELETE" })
      if (res.ok) router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      title="Delete document"
      className="kh-btn"
      style={{ padding: "3px 8px", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4, color: "#C0392B", cursor: deleting ? "not-allowed" : "pointer" }}
    >
      {deleting ? <Spinner size="sm" /> : <Trash2 size={12} />}
    </button>
  )
}
