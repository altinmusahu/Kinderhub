"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AddChildModal from "./AddChildModal"

export default function AddChildButton({ classId }: { classId: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="kh-btn"
        style={{
          marginLeft: "auto", padding: "5px 10px", fontSize: 11.5,
          background: "var(--kh-peach)", color: "#fff",
          border: "1px solid var(--kh-peach-d)", borderRadius: 8,
          display: "inline-flex", alignItems: "center", gap: 5,
          cursor: "pointer",
        }}
      >
        + Add child
      </button>

      {open && (
        <AddChildModal
          classId={classId}
          onClose={() => setOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
