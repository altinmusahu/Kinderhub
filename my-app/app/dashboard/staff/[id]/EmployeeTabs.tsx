"use client"

import { useState, useRef, useTransition } from "react"
import type { UserById } from "@/app/api/modules/user/user.types"

// ── types ──────────────────────────────────────────────────────────────────
type ClassRow = {
  id: string
  name: string
  average_year: string
  starts_at: string
  ends_at: string
  capacity: number
  locations: { name: string } | null
}

type DocRow = {
  id: string
  file_url: string
  storage_path: string
  created_at: string
}

type Props = {
  user: UserById
  userId: string
}

// ── helpers ────────────────────────────────────────────────────────────────
function fmt(t: string) {
  // "HH:MM:SS+00" → "HH:MM"
  return t ? t.slice(0, 5) : "—"
}

function fileName(url: string) {
  const parts = url.split("/")
  const raw = parts[parts.length - 1]
  // strip timestamp prefix "1234567890_filename.pdf" → "filename.pdf"
  return raw.replace(/^\d+_/, "")
}

function fileExt(url: string) {
  return fileName(url).split(".").pop()?.toUpperCase() ?? "FILE"
}

// ── sub-components ─────────────────────────────────────────────────────────
function Field({
  label, name, value, type = "text", disabled = false,
}: { label: string; name: string; value: string; type?: string; disabled?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, padding: "9px 0", borderTop: "1px solid var(--kh-border-soft)", fontSize: 12.5 }}>
      <label htmlFor={name} style={{ color: "var(--kh-ink-400)", alignSelf: "center" }}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={value}
        disabled={disabled}
        style={{
          background: disabled ? "transparent" : "var(--kh-ink-50)",
          border: disabled ? "none" : "1px solid var(--kh-border)",
          borderRadius: 6,
          padding: disabled ? "0" : "5px 9px",
          fontSize: 12.5,
          color: disabled ? "var(--kh-ink-800)" : "var(--kh-ink-900)",
          fontFamily: "inherit",
          outline: "none",
          width: "100%",
        }}
      />
    </div>
  )
}

function SaveBar({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
  return (
    <div style={{ display: "flex", gap: 8, padding: "12px 18px", borderTop: "1px solid var(--kh-border)", background: "var(--kh-ink-50)" }}>
      <button
        type="submit"
        disabled={saving}
        className="kh-btn kh-btn--primary"
        style={{ fontSize: 12.5 }}
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
      <button type="button" className="kh-btn" style={{ fontSize: 12.5 }} onClick={onCancel}>
        Cancel
      </button>
    </div>
  )
}

// ── Personal Information card ──────────────────────────────────────────────
function PersonalCard({ user, userId }: { user: UserById; userId: string }) {
  const [editing, setEditing] = useState(false)
  const [saving, startSave] = useTransition()
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body = {
      name:            fd.get("name"),
      lastname:        fd.get("lastname"),
      email:           fd.get("email"),
      phone_number:    fd.get("phone_number"),
      personal_number: fd.get("personal_number"),
      date_of_birth:   fd.get("date_of_birth"),
    }
    startSave(async () => {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) { setEditing(false); setError("") }
      else setError("Failed to save. Please try again.")
    })
  }

  const u = user.user
  return (
    <div className="kh-card">
      <div className="kh-card-header">
        <span className="kh-card-title">Personal Information</span>
        {!editing && (
          <button className="kh-btn" style={{ fontSize: 12 }} onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ padding: "4px 18px 4px" }}>
          <Field label="First name"     name="name"            value={u.name}            disabled={!editing} />
          <Field label="Last name"      name="lastname"        value={u.lastname}         disabled={!editing} />
          <Field label="Email"          name="email"           value={u.email}   type="email" disabled={!editing} />
          <Field label="Phone"          name="phone_number"    value={u.phone_number || ""} disabled={!editing} />
          <Field label="Personal No."   name="personal_number" value={u.personal_number || ""} disabled={!editing} />
          <Field label="Date of birth"  name="date_of_birth"   value={u.date_of_birth || ""} type="date" disabled={!editing} />
        </div>
        {error && <p style={{ padding: "0 18px", fontSize: 12, color: "#D2592F" }}>{error}</p>}
        {editing && <SaveBar saving={saving} onCancel={() => { setEditing(false); setError("") }} />}
      </form>
    </div>
  )
}

// ── Employment card ────────────────────────────────────────────────────────
function EmploymentCard({ user, userId }: { user: UserById; userId: string }) {
  const [editing, setEditing] = useState(false)
  const [saving, startSave] = useTransition()
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body = { role: fd.get("role"), is_active: fd.get("is_active") === "true" }
    startSave(async () => {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) { setEditing(false); setError("") }
      else setError("Failed to save. Please try again.")
    })
  }

  return (
    <div className="kh-card">
      <div className="kh-card-header">
        <span className="kh-card-title">Employment</span>
        {!editing && (
          <button className="kh-btn" style={{ fontSize: 12 }} onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ padding: "4px 18px 4px" }}>
          <Field label="Company"        name="_company"       value={user.tenant_name ?? "—"}       disabled />
          <Field label="Department"     name="_department"    value={user.department_name ?? "—"}    disabled />
          <Field label="Position"       name="_position"      value={user.position_name ?? "—"}      disabled />
          <Field label="Start date"     name="_start_date"    value={user.start_date ?? "—"}         disabled />
          {/* Editable fields */}
          {!editing ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, padding: "9px 0", borderTop: "1px solid var(--kh-border-soft)", fontSize: 12.5 }}>
                <span style={{ color: "var(--kh-ink-400)" }}>Role</span>
                <span style={{ color: "var(--kh-ink-800)" }}>{user.user.role || "—"}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, padding: "9px 0", borderTop: "1px solid var(--kh-border-soft)", fontSize: 12.5 }}>
                <span style={{ color: "var(--kh-ink-400)" }}>Status</span>
                <span style={{ color: user.user.is_active ? "#3A8C50" : "var(--kh-ink-500)" }}>
                  {user.user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, padding: "9px 0", borderTop: "1px solid var(--kh-border-soft)", fontSize: 12.5 }}>
                <label htmlFor="role" style={{ color: "var(--kh-ink-400)", alignSelf: "center" }}>Role</label>
                <input id="role" name="role" defaultValue={user.user.role || ""} style={{ background: "var(--kh-ink-50)", border: "1px solid var(--kh-border)", borderRadius: 6, padding: "5px 9px", fontSize: 12.5, fontFamily: "inherit", outline: "none", width: "100%" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, padding: "9px 0", borderTop: "1px solid var(--kh-border-soft)", fontSize: 12.5 }}>
                <label htmlFor="is_active" style={{ color: "var(--kh-ink-400)", alignSelf: "center" }}>Status</label>
                <select id="is_active" name="is_active" defaultValue={user.user.is_active ? "true" : "false"} style={{ background: "var(--kh-ink-50)", border: "1px solid var(--kh-border)", borderRadius: 6, padding: "5px 9px", fontSize: 12.5, fontFamily: "inherit", outline: "none", width: "100%" }}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </>
          )}
        </div>
        {error && <p style={{ padding: "0 18px", fontSize: 12, color: "#D2592F" }}>{error}</p>}
        {editing && <SaveBar saving={saving} onCancel={() => { setEditing(false); setError("") }} />}
      </form>
    </div>
  )
}

// ── Account Details card (read-only) ──────────────────────────────────────
function AccountCard({ user }: { user: UserById }) {
  const u = user.user
  function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, padding: "9px 0", borderTop: "1px solid var(--kh-border-soft)", fontSize: 12.5 }}>
        <span style={{ color: "var(--kh-ink-400)" }}>{label}</span>
        <span style={{ color: "var(--kh-ink-800)", fontFamily: mono ? "var(--kh-font-mono)" : undefined, fontSize: mono ? 11.5 : undefined, wordBreak: "break-all" }}>{value}</span>
      </div>
    )
  }
  return (
    <div className="kh-card">
      <div className="kh-card-header">
        <span className="kh-card-title">Account Details</span>
        <span style={{ fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>read-only</span>
      </div>
      <div style={{ padding: "4px 18px 14px" }}>
        <Row label="Employee ID"  value={u.id}                                       mono />
        <Row label="Joined"       value={u.created_at}                               mono />
        <Row label="First login"  value={u.is_first_login_executed ? "Completed" : "Pending"} />
      </div>
    </div>
  )
}

// ── Schedule tab ───────────────────────────────────────────────────────────
function ScheduleTab({ userId }: { userId: string }) {
  const [classes, setClasses] = useState<ClassRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function load() {
    if (loaded) return
    setLoading(true)
    const res = await fetch(`/api/users/${userId}/classes`)
    const data = await res.json()
    setClasses(Array.isArray(data) ? data : [])
    setLoading(false)
    setLoaded(true)
  }

  // auto-load when rendered
  if (!loaded && !loading) { load() }

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"]

  if (loading || !loaded) {
    return <div style={{ padding: 32, textAlign: "center", color: "var(--kh-ink-400)", fontSize: 13 }}>Loading schedule…</div>
  }

  if (!classes || classes.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 24, color: "var(--kh-ink-900)", marginBottom: 8 }}>No classes assigned</div>
        <div style={{ fontSize: 13, color: "var(--kh-ink-400)" }}>This employee is not assigned to any class as lead or assistant.</div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "20px 28px 40px" }}>
      <div>
        <h2 style={{ fontFamily: "var(--kh-font-serif)", fontSize: 22, margin: 0 }}>Weekly Schedule</h2>
        <p style={{ fontSize: 13, color: "var(--kh-ink-400)", margin: "4px 0 0" }}>Classes run Mon–Fri unless otherwise noted</p>
      </div>

      {/* Week view grid */}
      <div className="kh-card" style={{ overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: `80px repeat(${DAYS.length}, 1fr)`, borderBottom: "1px solid var(--kh-border)" }}>
          <div style={{ padding: "10px 12px", fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>TIME</div>
          {DAYS.map(d => (
            <div key={d} style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "var(--kh-ink-700)", borderLeft: "1px solid var(--kh-border)" }}>{d}</div>
          ))}
        </div>
        {classes.map(cls => (
          <div key={cls.id} style={{ display: "grid", gridTemplateColumns: `80px repeat(${DAYS.length}, 1fr)`, borderBottom: "1px solid var(--kh-border-soft)" }}>
            <div style={{ padding: "12px", borderRight: "1px solid var(--kh-border)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 11, fontFamily: "var(--kh-font-mono)", color: "var(--kh-ink-500)" }}>{fmt(cls.starts_at)}</div>
              <div style={{ fontSize: 10, fontFamily: "var(--kh-font-mono)", color: "var(--kh-ink-300)" }}>{fmt(cls.ends_at)}</div>
            </div>
            {DAYS.map(d => (
              <div key={d} style={{ borderLeft: "1px solid var(--kh-border-soft)", padding: "10px 12px" }}>
                <div style={{
                  background: "linear-gradient(180deg, #FEF0E8, #FDE8DA)",
                  borderLeft: "3px solid #D2592F",
                  borderRadius: 6, padding: "8px 10px",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#7A2810" }}>{cls.name}</div>
                  <div style={{ fontSize: 11, color: "#B24420", marginTop: 2 }}>Age {cls.average_year}</div>
                  {cls.locations && <div style={{ fontSize: 10.5, color: "#B24420", marginTop: 2, opacity: 0.8 }}>{cls.locations.name}</div>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Class cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {classes.map(cls => (
          <div key={cls.id} className="kh-card" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: "#D2592F", flexShrink: 0 }} />
              <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--kh-ink-900)" }}>{cls.name}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "var(--kh-ink-400)" }}>Age group</span>
                <span style={{ color: "var(--kh-ink-700)" }}>{cls.average_year}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "var(--kh-ink-400)" }}>Time</span>
                <span style={{ color: "var(--kh-ink-700)", fontFamily: "var(--kh-font-mono)", fontSize: 11.5 }}>{fmt(cls.starts_at)} – {fmt(cls.ends_at)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "var(--kh-ink-400)" }}>Capacity</span>
                <span style={{ color: "var(--kh-ink-700)" }}>{cls.capacity} children</span>
              </div>
              {cls.locations && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--kh-ink-400)" }}>Location</span>
                  <span style={{ color: "var(--kh-ink-700)" }}>{cls.locations.name}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Documents tab ──────────────────────────────────────────────────────────
function DocumentsTab({ userId }: { userId: string }) {
  const [docs, setDocs] = useState<DocRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  async function load() {
    if (loaded) return
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
    const res = await fetch(`/api/users/${userId}/documents`, { method: "POST", body: fd })
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
    const res = await fetch(`/api/users/${userId}/documents`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: doc.id, storagePath: doc.storage_path }),
    })
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
          <p style={{ fontSize: 13, color: "var(--kh-ink-400)", margin: "4px 0 0" }}>Employee files and attachments</p>
        </div>
        <div>
          <input ref={inputRef} type="file" id="doc-upload" style={{ display: "none" }} onChange={handleUpload} />
          <label htmlFor="doc-upload">
            <span className="kh-btn kh-btn--primary" style={{ fontSize: 12.5, cursor: "pointer", display: "inline-block" }}>
              {uploading ? "Uploading…" : "+ Upload document"}
            </span>
          </label>
        </div>
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
              {/* File icon */}
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
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="kh-btn"
                style={{ fontSize: 12, textDecoration: "none", flexShrink: 0 }}
              >
                View
              </a>
              <button
                className="kh-btn"
                style={{ fontSize: 12, color: "#D2592F", borderColor: "#F0C4A8", flexShrink: 0 }}
                onClick={() => handleDelete(doc)}
                disabled={deleting === doc.id}
              >
                {deleting === doc.id ? "…" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Overview tab (Personal Info + Employment + Account) ────────────────────
function OverviewTab({ user, userId }: { user: UserById; userId: string }) {
  return (
    <div style={{ padding: "20px 28px 40px", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <PersonalCard user={user} userId={userId} />
        <AccountCard user={user} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <EmploymentCard user={user} userId={userId} />
      </div>
    </div>
  )
}

// ── Main EmployeeTabs component ────────────────────────────────────────────
const TABS = ["Overview", "Schedule", "Documents"] as const
type Tab = typeof TABS[number]

export default function EmployeeTabs({ user, userId }: Props) {
  const [active, setActive] = useState<Tab>("Overview")

  return (
    <>
      {/* Tab strip */}
      <div style={{ display: "flex", gap: 18, padding: "0 28px" }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setActive(t)}
            style={{
              padding: "10px 2px",
              fontSize: 13,
              background: "none",
              border: "none",
              borderBottom: active === t ? "2px solid var(--kh-peach)" : "2px solid transparent",
              color: active === t ? "var(--kh-ink-900)" : "var(--kh-ink-500)",
              fontWeight: active === t ? 600 : 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {active === "Overview"   && <OverviewTab   user={user} userId={userId} />}
      {active === "Schedule"   && <ScheduleTab   userId={userId} />}
      {active === "Documents"  && <DocumentsTab  userId={userId} />}
    </>
  )
}
