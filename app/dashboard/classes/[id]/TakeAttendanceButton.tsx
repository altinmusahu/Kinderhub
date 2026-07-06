"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ClipboardList } from "lucide-react"
import TakeAttendanceModal from "./TakeAttendanceModal"

export default function TakeAttendanceButton({ classId, className }: { classId: string; className: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="kh-btn"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5 }}
      >
        <ClipboardList size={13} /> <span className="kh-btn-label">Take attendance</span>
      </button>

      {open && (
        <TakeAttendanceModal
          classId={classId}
          className={className}
          onClose={() => { setOpen(false); router.refresh() }}
        />
      )}
    </>
  )
}
