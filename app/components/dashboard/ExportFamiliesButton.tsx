"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"

export default function ExportFamiliesButton() {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const res = await fetch("/api/families/export")
      if (!res.ok) throw new Error("Export failed")

      const blob = await res.blob()
      const disposition = res.headers.get("Content-Disposition") ?? ""
      const match = disposition.match(/filename="(.+)"/)
      const filename = match?.[1] ?? "families-export.xlsx"

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      alert("Failed to export families list. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button className="kh-btn" onClick={handleExport} disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        {loading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={13} />}
        Export
      </button>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </>
  )
}
