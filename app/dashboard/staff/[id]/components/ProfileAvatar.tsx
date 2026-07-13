"use client"

import { useRef, useState } from "react"
import { Camera } from "lucide-react"
import { Spinner } from "@/components/ui/Spinner"

export function ProfileAvatar({
  userId, color, initials, isActive, initialUrl,
}: {
  userId: string
  color: string
  initials: string
  isActive: boolean
  initialUrl: string | null
}) {
  const [url, setUrl] = useState(initialUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError("")
    const fd = new FormData()
    fd.append("file", file)

    const res = await fetch(`/api/users/${userId}/profile-picture`, { method: "POST", body: fd })
    if (res.ok) {
      const profile = await res.json()
      setUrl(`${profile.file_url}?t=${Date.now()}`)
    } else {
      const d = await res.json().catch(() => ({}))
      setError(d?.error ?? "Upload failed.")
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        id="profile-picture-upload"
        style={{ display: "none" }}
        onChange={handleUpload}
      />
      <label htmlFor="profile-picture-upload" style={{ cursor: uploading ? "not-allowed" : "pointer", display: "block" }} className="kh-avatar-label">
        <div style={{
          width: 80, height: 80, borderRadius: 18,
          background: url ? "var(--kh-ink-100)" : color + "33",
          border: "3px solid var(--kh-surface)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 700, color,
          overflow: "hidden", position: "relative",
        }}>
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            initials
          )}
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: uploading ? 1 : 0, transition: "opacity 120ms",
          }}
            className="kh-avatar-hover-overlay"
          >
            {uploading && <Spinner size="sm" />}
          </div>
        </div>
        <div style={{
          position: "absolute", bottom: -4, right: -4,
          width: 26, height: 26, borderRadius: "50%",
          background: "var(--kh-peach)", border: "2.5px solid var(--kh-surface)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
        }}>
          <Camera size={12} color="#fff" />
        </div>
      </label>
      <span style={{
        position: "absolute", bottom: 2, left: 2,
        width: 14, height: 14, borderRadius: "50%",
        background: isActive ? "var(--kh-sage)" : "var(--kh-ink-300)",
        border: "2.5px solid var(--kh-surface)",
      }} />
      {error && (
        <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 6, fontSize: 11, color: "#D2592F", whiteSpace: "nowrap" }}>
          {error}
        </div>
      )}
      <style>{`
        .kh-avatar-label:hover .kh-avatar-hover-overlay { opacity: 1; }
      `}</style>
    </div>
  )
}
