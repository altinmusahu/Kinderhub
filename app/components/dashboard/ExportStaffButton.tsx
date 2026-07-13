"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Spinner } from "@/components/ui/Spinner"

export default function ExportStaffButton() {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const res = await fetch("/api/users/export")
      if (!res.ok) throw new Error("Export failed")

      const blob = await res.blob()
      const disposition = res.headers.get("Content-Disposition") ?? ""
      const match = disposition.match(/filename="(.+)"/)
      const filename = match?.[1] ?? "staff-export.xlsx"

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      alert("Failed to export staff list. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button className="kh-btn" onClick={handleExport} disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {loading ? <Spinner size="sm" /> : <Download size={13} />}
      Export
    </button>
  )
}
