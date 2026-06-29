"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AddParentModal from "./AddParentModal"

type Props = { familyId: string }

export default function AddParentButton({ familyId }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          marginLeft: "auto", padding: "5px 10px", fontSize: 11.5,
          background: "var(--kh-peach)", color: "#fff",
          border: "1px solid var(--kh-peach-d)", borderRadius: 8,
          display: "inline-flex", alignItems: "center", gap: 5,
          cursor: "pointer",
        }}
      >
        + Add parent
      </button>

      {open && (
        <AddParentModal
          familyId={familyId}
          onClose={() => setOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
