"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Modal, MField, MSection, MSelect, MBtn, MGrid, MSegmented } from "./Modal"

type Family = { id: string; name: string }
type Staff = { id: string; name: string; lastname: string }
type Kid = { id: string; firstname: string; lastname: string }

const TARGETS = ["Family", "Staff", "Child"] as const
type Target = typeof TARGETS[number]

export default function UploadDocumentModal({ triggerLabel = "+ Upload document" }: { triggerLabel?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, startSave] = useTransition()
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const [target, setTarget] = useState<Target>("Family")
  const [subjectId, setSubjectId] = useState("")
  const [fileName, setFileName] = useState("")

  const [families, setFamilies] = useState<Family[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [kids, setKids] = useState<Kid[]>([])
  const [loadingOptions, setLoadingOptions] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoadingOptions(true)
    Promise.all([
      fetch("/api/families").then(r => r.json()).catch(() => []),
      fetch("/api/users").then(r => r.json()).catch(() => []),
      fetch("/api/kids").then(r => r.json()).catch(() => []),
    ]).then(([f, s, k]) => {
      setFamilies(Array.isArray(f) ? f : [])
      setStaff(Array.isArray(s) ? s : [])
      setKids(Array.isArray(k) ? k : [])
    }).finally(() => setLoadingOptions(false))
  }, [open])

  function close() {
    setOpen(false)
    setError("")
    setTarget("Family")
    setSubjectId("")
    setFileName("")
    if (fileRef.current) fileRef.current.value = ""
  }

  function handleSubmit() {
    setError("")
    const file = fileRef.current?.files?.[0]
    if (!file) { setError("Choose a file to upload."); return }
    if (!subjectId) { setError(`Select a ${target.toLowerCase()}.`); return }

    startSave(async () => {
      const fd = new FormData()
      fd.append("file", file)
      if (target === "Family") fd.append("family_id", subjectId)
      if (target === "Staff") fd.append("user_id", subjectId)
      if (target === "Child") fd.append("kid_id", subjectId)

      const res = await fetch("/api/documents", { method: "POST", body: fd })
      if (res.ok) {
        close()
        router.refresh()
      } else {
        const j = await res.json().catch(() => ({}))
        setError(j?.message || j?.error || "Upload failed. Please try again.")
      }
    })
  }

  const options = target === "Family" ? families : target === "Staff" ? staff : kids

  return (
    <>
      <button className="kh-btn kh-btn--primary" onClick={() => setOpen(true)}>{triggerLabel}</button>

      <Modal
        open={open}
        onClose={close}
        title="Upload document"
        sub="Attach a file to a family, staff member, or child"
        icon="📄"
        iconBg="#FEF0E8"
        iconColor="#B24420"
        width={520}
        footer={
          <>
            <MBtn variant="ghost" onClick={close}>Cancel</MBtn>
            <MBtn variant="accent" disabled={saving} onClick={handleSubmit}>{saving ? "Uploading…" : "Upload"}</MBtn>
          </>
        }
      >
        <div style={{ padding: "18px 22px 6px" }}>
          <MSection title="Attach to">
            <MSegmented options={[...TARGETS]} value={target} onChange={(v) => { setTarget(v as Target); setSubjectId("") }} />
          </MSection>

          <MSection title={`Select ${target.toLowerCase()}`}>
            <MGrid cols={2}>
              <MField label={target} required colSpan={2}>
                <MSelect value={subjectId} onChange={e => setSubjectId(e.target.value)} disabled={loadingOptions}>
                  <option value="">{loadingOptions ? "Loading…" : `— Select ${target.toLowerCase()} —`}</option>
                  {target === "Family" && families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  {target === "Staff" && staff.map(s => <option key={s.id} value={s.id}>{s.name} {s.lastname}</option>)}
                  {target === "Child" && kids.map(k => <option key={k.id} value={k.id}>{k.firstname} {k.lastname}</option>)}
                </MSelect>
              </MField>
            </MGrid>
            {!loadingOptions && options.length === 0 && (
              <p style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginTop: 8 }}>No {target.toLowerCase()}s found.</p>
            )}
          </MSection>

          <MSection title="File">
            <input
              ref={fileRef}
              type="file"
              id="doc-file-input"
              style={{ display: "none" }}
              onChange={e => setFileName(e.target.files?.[0]?.name ?? "")}
            />
            <label htmlFor="doc-file-input" style={{ display: "block", cursor: "pointer" }}>
              <div style={{
                border: "1px dashed var(--kh-border)", borderRadius: 11, padding: "20px 14px",
                textAlign: "center", background: "var(--kh-ink-50)", fontSize: 12.5, color: "var(--kh-ink-600)",
              }}>
                {fileName || "Click to choose a file…"}
              </div>
            </label>
          </MSection>

          {error && <p style={{ fontSize: 12.5, color: "#D2592F", marginBottom: 10 }}>{error}</p>}
        </div>
      </Modal>
    </>
  )
}
