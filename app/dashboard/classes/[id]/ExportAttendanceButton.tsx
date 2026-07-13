"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Spinner } from "@/components/ui/Spinner"

export default function ExportAttendanceButton({ classId, queryString, label = "Export to Excel" }: { classId: string; queryString: string; label?: string }) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const res = await fetch(`/api/classes/${classId}/attendance/export${queryString ? `?${queryString}` : ""}`)
      if (!res.ok) throw new Error("Export failed")

      const blob = await res.blob()
      const disposition = res.headers.get("Content-Disposition") ?? ""
      const match = disposition.match(/filename="(.+)"/)
      const filename = match?.[1] ?? "attendance-export.xlsx"

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      alert("Failed to export attendance. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button className="kh-btn" onClick={handleExport} disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
      {loading ? <Spinner size="sm" /> : <Download size={13} />}
      <span className="kh-btn-label">{label}</span>
    </button>
  )
}
