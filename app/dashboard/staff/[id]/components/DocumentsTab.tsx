"use client"

import { useState, useRef } from "react"
import type { DocRow } from "./types"

function fileName(url: string) {
  const withoutQuery = url.split("?")[0]
  const raw = withoutQuery.split("/").pop() ?? ""
  return raw.replace(/^\d+_/, "")
}

function fileExt(url: string) {
  return fileName(url).split(".").pop()?.toUpperCase() ?? "FILE"
}

export function DocumentsTab({ userId, familyId, title, canEdit = true }: { userId?: string, familyId?: string, title: string, canEdit?: boolean }) {
  const [docs, setDocs] = useState<DocRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  async function load() {
    if (loaded) return
    if(userId === undefined && userId === null) return
    setLoading(true)
    const res = await fetch(`/api/users/${userId}/documents`)
    const data = await res.json()
    setDocs(Array.isArray(data) ? data : [])
    setLoading(false)
    setLoaded(true)
  }

  if (!loaded && !loading) { load() }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError("")
    const fd = new FormData()
    fd.append("file", file)

    let res

    if(userId) {
      res = await fetch(`/api/users/${userId}/documents`, { method: "POST", body: fd })
    } else if (familyId) {
      res = await fetch(`/api/families/${familyId}/documents`, { method: "POST", body: fd })
    } else {
      setError("No user or family ID provided.")
      setUploading(false)
      return
    }

    if (res.ok) {
      const doc: DocRow = await res.json()
      setDocs(prev => [doc, ...(prev ?? [])])
    } else {
      setError("Upload failed. Please try again.")
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  async function handleDelete(doc: DocRow) {
    setDeleting(doc.id)
    let res
    
    if(userId) {
      res = await fetch(`/api/users/${userId}/documents`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id, storagePath: doc.storage_path }),
      })
    } else if (familyId) {
      res = await fetch(`/api/families/${familyId}/documents`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id, storagePath: doc.storage_path }),
      })
    } else {
      setError("No user or family ID provided.")
      setDeleting(null)
      return
    }
    if (res.ok) {
      setDocs(prev => (prev ?? []).filter(d => d.id !== doc.id))
    } else {
      setError("Delete failed.")
    }
    setDeleting(null)
  }

  return (
    <div style={{ padding: "20px 28px 40px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontFamily: "var(--kh-font-serif)", fontSize: 22, margin: 0 }}>Documents</h2>
          <p style={{ fontSize: 13, color: "var(--kh-ink-400)", margin: "4px 0 0" }}>{title} and attachments</p>
        </div>
        {canEdit && (
          <div>
            <input ref={inputRef} type="file" id="doc-upload" style={{ display: "none" }} onChange={handleUpload} />
            <label htmlFor="doc-upload">
              <span className="kh-btn kh-btn--primary" style={{ fontSize: 12.5, cursor: "pointer", display: "inline-block" }}>
                {uploading ? "Uploading…" : "+ Upload document"}
              </span>
            </label>
          </div>
        )}
      </div>

      {error && <p style={{ fontSize: 12, color: "#D2592F", marginBottom: 12 }}>{error}</p>}

      {(loading || !loaded) && (
        <div style={{ padding: 32, textAlign: "center", color: "var(--kh-ink-400)", fontSize: 13 }}>Loading documents…</div>
      )}

      {loaded && (!docs || docs.length === 0) && (
        <div style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 22, color: "var(--kh-ink-900)", marginBottom: 8 }}>No documents yet</div>
          <div style={{ fontSize: 13, color: "var(--kh-ink-400)" }}>Upload files using the button above.</div>
        </div>
      )}

      {loaded && docs && docs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {docs.map(doc => (
            <div key={doc.id} className="kh-card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                background: "#FEF0E8", border: "1px solid #F0C4A8",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: "#D2592F",
                fontFamily: "var(--kh-font-mono)",
              }}>
                {fileExt(doc.file_url)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--kh-ink-900)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {fileName(doc.file_url)}
                </div>
                <div style={{ fontSize: 11, color: "var(--kh-ink-400)", marginTop: 2, fontFamily: "var(--kh-font-mono)" }}>
                  {new Date(doc.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </div>
              </div>
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="kh-btn" style={{ fontSize: 12, textDecoration: "none", flexShrink: 0 }}>
                View
              </a>
              {canEdit && (
                <button
                  className="kh-btn"
                  style={{ fontSize: 12, color: "#D2592F", borderColor: "#F0C4A8", flexShrink: 0 }}
                  onClick={() => handleDelete(doc)}
                  disabled={deleting === doc.id}
                >
                  {deleting === doc.id ? "…" : "Delete"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
