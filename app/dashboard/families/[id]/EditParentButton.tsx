"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import type { FamilyParent } from "@/app/api/modules/families/families.types"
import EditParentModal from "./EditParentModal"

export default function EditParentButton({ parent }: { parent: FamilyParent }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Edit parent"
        style={{
          width: 28, height: 28, borderRadius: 7,
          border: "1px solid var(--kh-border)",
          background: "var(--kh-bg)",
          cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: "var(--kh-ink-500)",
          flexShrink: 0,
        }}
      >
        <Pencil size={13} />
      </button>

      {open && (
        <EditParentModal
          parent={parent}
          onClose={() => setOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
