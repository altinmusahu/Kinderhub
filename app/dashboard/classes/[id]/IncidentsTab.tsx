"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Plus, Trash2, X } from "lucide-react"
import type { Kids } from "@/app/api/modules/kids/kids.types"
import type { IncidentWithDetails } from "@/app/api/modules/incidents/incidents.types"

const INCIDENT_TYPES = ["Injury", "Illness", "Behavior", "Allergy reaction", "Other"]
const SEVERITIES = ["Low", "Medium", "High"] as const

const SEVERITY_TONE: Record<string, { bg: string; color: string }> = {
  Low: { bg: "var(--kh-sage-bg)", color: "var(--kh-sage-d)" },
  Medium: { bg: "#FEF3E2", color: "#B07A1A" },
  High: { bg: "#FDEAEA", color: "#C0392B" },
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function ReportIncidentForm({
  classId,
  roster,
  onClose,
  onAdded,
}: {
  classId: string
  roster: Kids[]
  onClose: () => void
  onAdded: (incident: IncidentWithDetails) => void
}) {
  const [kidId, setKidId] = useState(roster[0]?.id ?? "")
  const [type, setType] = useState(INCIDENT_TYPES[0])
  const [description, setDescription] = useState("")
  const [actionTaken, setActionTaken] = useState("")
  const [severity, setSeverity] = useState<typeof SEVERITIES[number]>("Low")
  const [parentNotified, setParentNotified] = useState(false)
  const [notifiedAt, setNotifiedAt] = useState(() => new Date().toISOString().slice(0, 16))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function submit() {
    if (!kidId) { setError("Select a child."); return }
    if (!description.trim()) { setError("Description is required."); return }
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/classes/${classId}/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kid_id: kidId,
          incident_type: type,
          description: description.trim(),
          action_taken: actionTaken.trim() || null,
          parent_notified: parentNotified,
          notified_at: new Date(notifiedAt).toISOString(),
          severity,
        }),
      })
      if (res.ok) {
        const incident: IncidentWithDetails = await res.json()
        onAdded(incident)
        onClose()
      } else {
        const j = await res.json().catch(() => ({}))
        setError(j.error ?? "Failed to report incident.")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(42,32,24,0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: "var(--kh-surface)", borderRadius: 18, width: "100%", maxWidth: 480, boxShadow: "0 24px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", overflow: "hidden", maxHeight: "90dvh" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", borderBottom: "1px solid var(--kh-ink-100)", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 20, color: "var(--kh-ink-900)" }}>Report incident</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--kh-ink-100)", background: "var(--kh-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-ink-500)" }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: "16px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>Child *</label>
            <select value={kidId} onChange={(e) => setKidId(e.target.value)} style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none" }}>
              {roster.length === 0 && <option value="">No children in this class</option>}
              {roster.map((k) => <option key={k.id} value={k.id}>{k.firstname} {k.lastname}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>Type *</label>
              <select value={type} onChange={(e) => setType(e.target.value)} style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none" }}>
                {INCIDENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>Severity *</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value as typeof severity)} style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none" }}>
                {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>Action taken</label>
            <textarea value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} rows={2} style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", border: "1px solid var(--kh-border)", borderRadius: 8 }}>
            <input type="checkbox" checked={parentNotified} onChange={(e) => setParentNotified(e.target.checked)} id="parent-notified" />
            <label htmlFor="parent-notified" style={{ fontSize: 12.5, color: "var(--kh-ink-700)", flex: 1 }}>Parent has been notified</label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>Notified at *</label>
            <input type="datetime-local" value={notifiedAt} onChange={(e) => setNotifiedAt(e.target.value)} style={{ border: "1px solid var(--kh-border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none" }} />
          </div>

          {error && (
            <div style={{ padding: "8px 12px", background: "var(--kh-pink-bg)", borderRadius: 8, fontSize: 12, color: "var(--kh-pink-d)" }}>{error}</div>
          )}
        </div>

        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--kh-ink-100)", display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "1px solid var(--kh-ink-200)", background: "var(--kh-bg)", color: "var(--kh-ink-700)", cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} disabled={saving || roster.length === 0} style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: saving ? "not-allowed" : "pointer", background: saving ? "var(--kh-ink-200)" : "var(--kh-peach)", color: saving ? "var(--kh-ink-400)" : "#fff" }}>
            {saving ? "Reporting…" : "Report incident"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function IncidentsTab({ classId, roster }: { classId: string; roster: Kids[] }) {
  const [incidents, setIncidents] = useState<IncidentWithDetails[] | null>(null)
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    if (loaded) return
    setLoaded(true)
    Promise.all([
      fetch(`/api/classes/${classId}/incidents`).then((r) => r.json()),
      fetch(`/api/auth/me`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([incidentsData, me]) => {
      setIncidents(Array.isArray(incidentsData) ? incidentsData : [])
      setMyUserId(me?.sub ?? null)
    })
  }, [classId, loaded])

  async function deleteIncident(id: string) {
    const res = await fetch(`/api/classes/${classId}/incidents/${id}`, { method: "DELETE" })
    if (res.ok) setIncidents((prev) => (prev ?? []).filter((i) => i.id !== id))
  }

  if (incidents === null) {
    return <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>Loading…</div>
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 820 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-800)" }}>Incidents</span>
        <span style={{ fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>{incidents.length} logged</span>
        <button
          onClick={() => setFormOpen(true)}
          style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, border: "none", background: "var(--kh-peach)", color: "#fff", cursor: "pointer" }}
        >
          <Plus size={13} /> Report incident
        </button>
      </div>

      {incidents.length === 0 ? (
        <div className="kh-card" style={{ padding: "32px 16px", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>
          No incidents logged for this class.
        </div>
      ) : (
        incidents.map((inc) => {
          const tone = SEVERITY_TONE[inc.severity] ?? { bg: "var(--kh-ink-50)", color: "var(--kh-ink-600)" }
          const isMine = myUserId !== null && inc.reported_by === myUserId
          return (
            <div key={inc.id} className="kh-card" style={{ padding: "14px 16px", borderColor: inc.severity === "High" ? "var(--kh-pink-l)" : undefined }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 7, background: "var(--kh-peach-bg)", color: "var(--kh-peach-d)", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                  {initials(inc.kid_name ?? "?")}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--kh-ink-900)" }}>{inc.kid_name ?? "Unknown child"}</span>
                <span style={{ fontSize: 11.5, color: "var(--kh-ink-500)" }}>{inc.incident_type}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: tone.color, background: tone.bg, borderRadius: 999, padding: "2px 8px" }}>
                  {inc.severity === "High" && <AlertTriangle size={11} />}
                  {inc.severity}
                </span>
                <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>{formatDateTime(inc.created_at)}</span>
                {isMine && (
                  <button onClick={() => deleteIncident(inc.id)} title="Delete incident" style={{ background: "none", border: "none", color: "var(--kh-ink-300)", cursor: "pointer", display: "flex" }}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <div style={{ fontSize: 13, color: "var(--kh-ink-800)", lineHeight: 1.6, marginTop: 9 }}>{inc.description}</div>
              {inc.action_taken && (
                <div style={{ fontSize: 12.5, color: "var(--kh-ink-600)", marginTop: 6 }}>
                  <span style={{ fontWeight: 600 }}>Action taken: </span>{inc.action_taken}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10, fontSize: 11.5, color: "var(--kh-ink-400)" }}>
                <span>Reported by {inc.reported_by_name ?? "Unknown"}</span>
                {inc.parent_notified ? (
                  <span style={{ color: "var(--kh-sage-d)" }}>Parent notified {formatDateTime(inc.notified_at)}</span>
                ) : (
                  <span style={{ color: "#C0392B" }}>Parent not yet notified</span>
                )}
              </div>
            </div>
          )
        })
      )}

      {formOpen && (
        <ReportIncidentForm
          classId={classId}
          roster={roster}
          onClose={() => setFormOpen(false)}
          onAdded={(incident) => setIncidents((prev) => [incident, ...(prev ?? [])])}
        />
      )}
    </div>
  )
}
