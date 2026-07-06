"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AddKidModal from "./AddKidModal"

type Props = { familyId: string, class_id: string | null }

export default function AddKidButton({ familyId, class_id }: Props) {
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
        + Add kid
      </button>

      {open && (
        <AddKidModal
          familyId={familyId}
          class_id={class_id}
          onClose={() => setOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
