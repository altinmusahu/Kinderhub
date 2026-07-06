"use client"

import { useEffect, useState } from "react"
import { Check, X } from "lucide-react"
import type { KidAttendanceWithDetails } from "@/app/api/modules/kid_attendance/kid_attendance.types"
import { notifyAttendanceUpdated } from "@/lib/attendance-events"

type Parent = { id: string; firstname: string; lastname: string }

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
}

function fmtTime(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

const STATUS_TONE: Record<string, { bg: string; color: string; label: string }> = {
  in: { bg: "var(--kh-sage-bg)", color: "var(--kh-sage-d)", label: "Checked in" },
  late: { bg: "#FEF3E2", color: "#B07A1A", label: "Late" },
  out: { bg: "var(--kh-ink-50)", color: "var(--kh-ink-600)", label: "Checked out" },
  absent: { bg: "#FDEAEA", color: "#C0392B", label: "Absent" },
  pending: { bg: "var(--kh-ink-50)", color: "var(--kh-ink-400)", label: "Not arrived" },
}

function CheckoutDetail({
  classId,
  kidId,
  kidName,
  onSaved,
  onToast,
}: {
  classId: string
  kidId: string
  kidName: string
  onSaved: (row: KidAttendanceWithDetails) => void
  onToast: (message: string) => void
}) {
  const [parents, setParents] = useState<Parent[]>([])
  const [checkOutTo, setCheckOutTo] = useState("")
  const [backup, setBackup] = useState("")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/kids/${classId}/kids/${kidId}/parents`)
      .then((r) => r.json())
      .then((d: Parent[]) => setParents(Array.isArray(d) ? d : []))
      .catch(() => setParents([]))
  }, [classId, kidId])

  const today = new Date().toISOString().split("T")[0]

  async function save() {
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/classes/${classId}/attendance/${today}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kid_id: kidId,
          action: "check_out",
          check_out_to: checkOutTo || null,
          back_up_check_out_to: backup.trim() || null,
          pickup_note: note.trim() || null,
        }),
      })
      if (res.ok) {
        onSaved(await res.json())
        onToast(`${kidName} was checked out.`)
        notifyAttendanceUpdated(classId)
      } else {
        setError("Failed to save check-out. Please try again.")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ marginLeft: 37, marginTop: 8, padding: "10px 12px", background: "var(--kh-bg)", border: "1px solid var(--kh-ink-100)", borderRadius: 11, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Released to</div>
          <select value={checkOutTo} onChange={(e) => setCheckOutTo(e.target.value)} style={{ width: "100%", border: "1px solid var(--kh-border)", borderRadius: 9, padding: "7px 9px", fontSize: 12.5, background: "var(--kh-surface)" }}>
            <option value="">— Select parent —</option>
            {parents.map((p) => <option key={p.id} value={p.id}>{p.firstname} {p.lastname}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Backup person (if not listed)</div>
          <input value={backup} onChange={(e) => setBackup(e.target.value)} placeholder="Name of backup pickup…" style={{ width: "100%", border: "1px solid var(--kh-border)", borderRadius: 9, padding: "7px 9px", fontSize: 12.5, background: "var(--kh-surface)", outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Pickup note</div>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note…" style={{ width: "100%", border: "1px solid var(--kh-border)", borderRadius: 9, padding: "7px 9px", fontSize: 12.5, background: "var(--kh-surface)", outline: "none", boxSizing: "border-box" }} />
      </div>
      {error && <span style={{ fontSize: 11.5, color: "#C0392B" }}>{error}</span>}
      <button onClick={save} disabled={saving} style={{ alignSelf: "flex-start", fontSize: 12, fontWeight: 600, padding: "6px 14px", border: "none", borderRadius: 8, background: "var(--kh-peach)", color: "#fff", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
        {saving ? "Saving…" : "Confirm check-out"}
      </button>
    </div>
  )
}

function AbsentDetail({
  classId,
  kidId,
  kidName,
  onSaved,
  onToast,
}: {
  classId: string
  kidId: string
  kidName: string
  onSaved: (row: KidAttendanceWithDetails) => void
  onToast: (message: string) => void
}) {
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)
  const today = new Date().toISOString().split("T")[0]

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/classes/${classId}/attendance/${today}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kid_id: kidId, action: "absent", absent_reason: reason.trim() || null }),
      })
      if (res.ok) {
        onSaved(await res.json())
        onToast(`${kidName} marked absent.`)
        notifyAttendanceUpdated(classId)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ marginLeft: 37, marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em", flexShrink: 0 }}>Reason</div>
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        onBlur={save}
        placeholder="Why the child is absent…"
        style={{ flex: 1, border: "1px solid var(--kh-ink-100)", borderRadius: 9, padding: "7px 10px", fontSize: 12, color: "var(--kh-ink-800)", background: "var(--kh-bg)", outline: "none" }}
      />
      {saving && <span style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>Saving…</span>}
    </div>
  )
}

export default function TakeAttendanceModal({
  classId,
  className,
  onClose,
}: {
  classId: string
  className: string
  onClose: () => void
}) {
  const [rows, setRows] = useState<KidAttendanceWithDetails[] | null>(null)
  const [expandedKidId, setExpandedKidId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    fetch(`/api/classes/${classId}/attendance/${today}`)
      .then((r) => r.json())
      .then((d: KidAttendanceWithDetails[]) => setRows(Array.isArray(d) ? d : []))
  }, [classId, today])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  function updateRow(kidId: string, row: KidAttendanceWithDetails) {
    setRows((prev) => (prev ?? []).map((r) => (r.kid_id === kidId ? row : r)))
  }

  async function quickAction(kidId: string, kidName: string, action: "check_in" | "check_out") {
    const res = await fetch(`/api/classes/${classId}/attendance/${today}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kid_id: kidId, action }),
    })
    if (res.ok) {
      const row: KidAttendanceWithDetails = await res.json()
      if (action === "check_out") {
        setExpandedKidId(kidId)
      } else {
        setToast(`${kidName} was checked in.`)
        notifyAttendanceUpdated(classId)
      }
      updateRow(kidId, row)
    }
  }

  async function markAllPresent() {
    if (!rows) return
    const pending = rows.filter((r) => r.status === "pending")
    if (pending.length === 0) return
    await Promise.all(
      pending.map((r) =>
        fetch(`/api/classes/${classId}/attendance/${today}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kid_id: r.kid_id, action: "check_in" }),
        }).then((res) => (res.ok ? res.json() : null))
      )
    ).then((updated) => {
      updated.forEach((row) => row && updateRow(row.kid_id, row))
      setToast(`Marked ${pending.length} ${pending.length === 1 ? "child" : "children"} present.`)
      notifyAttendanceUpdated(classId)
    })
  }

  const marked = rows?.filter((r) => r.status !== "pending").length ?? 0
  const total = rows?.length ?? 0
  const counts = {
    in: rows?.filter((r) => r.status === "in").length ?? 0,
    late: rows?.filter((r) => r.status === "late").length ?? 0,
    out: rows?.filter((r) => r.status === "out").length ?? 0,
    absent: rows?.filter((r) => r.status === "absent").length ?? 0,
    pending: rows?.filter((r) => r.status === "pending").length ?? 0,
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(42,32,24,0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: 760, maxWidth: "100%", maxHeight: "92%", background: "var(--kh-surface)", borderRadius: 18, boxShadow: "0 24px 70px rgba(42,36,28,.35)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "18px 22px 0", background: "linear-gradient(180deg, var(--kh-peach-bg), var(--kh-surface) 85%)", borderBottom: "1px solid var(--kh-ink-100)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(150deg, var(--kh-peach-l), var(--kh-peach))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Check size={19} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 21, color: "var(--kh-ink-900)" }}>Take attendance — {className}</div>
              <div style={{ fontSize: 12, color: "var(--kh-ink-500)", marginTop: 1 }}>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
            </div>
            <div style={{ fontFamily: "var(--kh-font-mono)", fontSize: 12, color: "var(--kh-ink-500)", padding: "6px 10px", background: "var(--kh-surface)", border: "1px solid var(--kh-ink-100)", borderRadius: 9, flexShrink: 0 }}>
              {marked} / {total} marked
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--kh-ink-400)", cursor: "pointer", display: "flex", flexShrink: 0 }}>
              <X size={17} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, paddingBottom: 6 }}>
            <button onClick={markAllPresent} style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, padding: "5px 10px", border: "1px solid var(--kh-border)", borderRadius: 7, background: "var(--kh-bg)", color: "var(--kh-ink-600)", cursor: "pointer" }}>
              <Check size={12} /> Mark all present
            </button>
          </div>
        </div>

        {toast && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 22px", background: "var(--kh-sage-bg)", color: "var(--kh-sage-d)", fontSize: 12.5, fontWeight: 500, borderBottom: "1px solid var(--kh-ink-100)" }}>
            <Check size={13} /> {toast}
          </div>
        )}

        {/* Rows */}
        <div style={{ overflow: "auto", padding: "6px 22px 4px", flex: 1 }}>
          {rows === null ? (
            <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>Loading…</div>
          ) : rows.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>No children in this class yet.</div>
          ) : (
            rows.map((r, i) => {
              const tone = STATUS_TONE[r.status ?? "pending"]
              const time = fmtTime(r.status === "out" ? r.check_out : r.check_in)
              return (
                <div key={r.kid_id} style={{ borderTop: i === 0 ? "none" : "1px solid var(--kh-ink-50)", padding: "10px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 8, background: "var(--kh-peach-bg)", color: "var(--kh-peach-d)", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                      {initials(r.kid_name ?? "?")}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--kh-ink-900)" }}>{r.kid_name}</div>
                    </div>
                    {time && <span style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11.5, color: "var(--kh-ink-500)" }}>{time}</span>}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: tone.color, background: tone.bg, borderRadius: 999, padding: "2px 8px" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: tone.color }} /> {tone.label}
                    </span>
                    <div style={{ display: "flex", gap: 5 }}>
                      {r.status === "pending" ? (
                        <>
                          <button onClick={() => quickAction(r.kid_id, r.kid_name ?? "Child", "check_in")} style={{ fontSize: 11.5, padding: "4px 10px", border: "none", borderRadius: 7, background: "var(--kh-peach)", color: "#fff", cursor: "pointer" }}>Check in</button>
                          <button onClick={() => setExpandedKidId(expandedKidId === r.kid_id ? null : r.kid_id)} style={{ fontSize: 11.5, padding: "4px 10px", border: "1px solid var(--kh-border)", borderRadius: 7, background: "var(--kh-bg)", color: "var(--kh-ink-600)", cursor: "pointer" }}>Absent</button>
                        </>
                      ) : r.status === "in" || r.status === "late" ? (
                        <button onClick={() => quickAction(r.kid_id, r.kid_name ?? "Child", "check_out")} style={{ fontSize: 11.5, padding: "4px 10px", border: "1px solid var(--kh-border)", borderRadius: 7, background: "var(--kh-bg)", color: "var(--kh-ink-600)", cursor: "pointer" }}>Check out</button>
                      ) : (
                        <button onClick={() => setExpandedKidId(expandedKidId === r.kid_id ? null : r.kid_id)} style={{ fontSize: 11.5, padding: "4px 10px", border: "1px solid var(--kh-border)", borderRadius: 7, background: "var(--kh-bg)", color: "var(--kh-ink-600)", cursor: "pointer" }}>Edit</button>
                      )}
                    </div>
                  </div>

                  {r.status === "absent" && (
                    <AbsentDetail classId={classId} kidId={r.kid_id} kidName={r.kid_name ?? "Child"} onSaved={(row) => updateRow(r.kid_id, row)} onToast={setToast} />
                  )}
                  {(r.status === "out" || expandedKidId === r.kid_id) && r.status !== "absent" && r.status !== "pending" && (
                    <CheckoutDetail classId={classId} kidId={r.kid_id} kidName={r.kid_name ?? "Child"} onSaved={(row) => { updateRow(r.kid_id, row); setExpandedKidId(null) }} onToast={setToast} />
                  )}
                  {r.status === "pending" && expandedKidId === r.kid_id && (
                    <AbsentDetail classId={classId} kidId={r.kid_id} kidName={r.kid_name ?? "Child"} onSaved={(row) => { updateRow(r.kid_id, row); setExpandedKidId(null) }} onToast={setToast} />
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "13px 22px", borderTop: "1px solid var(--kh-ink-100)", display: "flex", alignItems: "center", gap: 10, background: "var(--kh-bg)" }}>
          <span style={{ fontSize: 11.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>
            {counts.in} in · {counts.late} late · {counts.out} out · {counts.absent} absent · {counts.pending} pending
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "1px solid var(--kh-ink-200)", background: "var(--kh-surface)", color: "var(--kh-ink-700)", cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  )
}
