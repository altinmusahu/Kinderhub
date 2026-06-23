"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Modal, MField, MSection, MGrid, MInput, MSelect, MBtn } from "./Modal"

type User = { id: string; name: string; lastname: string }
type Location = { id: string; name: string }

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function AddClassModal({ triggerLabel = "+ New class" }: { triggerLabel?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, startSave] = useTransition()
  const [error, setError] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [activeDays, setActiveDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"])

  const [form, setForm] = useState({
    name: "", average_year: "", location_id: "",
    starts_at: "08:00", ends_at: "17:30",
    capacity: "", lead_user_id: "", assistant_user_id: "",
  })

  useEffect(() => {
    if (!open) return
    fetch("/api/users").then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : [])).catch(() => {})
    fetch("/api/locations").then(r => r.json()).then(d => setLocations(Array.isArray(d) ? d : [])).catch(() => {})
  }, [open])

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }
  function toggleDay(d: string) { setActiveDays(ds => ds.includes(d) ? ds.filter(x => x !== d) : [...ds, d]) }

  function close() { setOpen(false); setError("") }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    startSave(async () => {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          average_year: form.average_year,
          location_id: form.location_id,
          starts_at: form.starts_at,
          ends_at: form.ends_at,
          capacity: parseInt(form.capacity),
          lead_user_id: form.lead_user_id,
          assistant_user_id: form.assistant_user_id,
        }),
      })
      if (res.ok) { close(); router.refresh() }
      else {
        const j = await res.json().catch(() => ({}))
        setError(j?.error || "Failed to create class.")
      }
    })
  }

  return (
    <>
      <button className="kh-btn kh-btn--primary" onClick={() => setOpen(true)}>{triggerLabel}</button>

      <Modal
        open={open}
        onClose={close}
        title="Create a class"
        sub="Set up a room, its schedule, and the team who runs it."
        icon="📚"
        iconBg="#FCEEF0"
        iconColor="#A85060"
        width={640}
        footer={
          <>
            <MBtn variant="ghost" onClick={close}>Cancel</MBtn>
            <MBtn variant="accent" type="submit" disabled={saving}
              onClick={() => (document.getElementById("add-class-form") as HTMLFormElement)?.requestSubmit()}>
              {saving ? "Creating…" : "Create class"}
            </MBtn>
          </>
        }
      >
        <form id="add-class-form" onSubmit={handleSubmit} style={{ padding: "18px 22px 6px" }}>
          <MSection idx="01" title="Class details">
            <MGrid>
              <MField label="Class name" required>
                <MInput value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Willow" required autoFocus />
              </MField>
              <MField label="Age range" required hint="Shown to families">
                <MInput value={form.average_year} onChange={e => set("average_year", e.target.value)} placeholder="e.g. 2–3 yr" required />
              </MField>
              <MField label="Location" required>
                <MSelect value={form.location_id} onChange={e => set("location_id", e.target.value)} required>
                  <option value="">Select location</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </MSelect>
              </MField>
              <MField label="Capacity" required>
                <MInput type="number" value={form.capacity} onChange={e => set("capacity", e.target.value)} suf="children" placeholder="12" required />
              </MField>
            </MGrid>
          </MSection>

          <MSection idx="02" title="Schedule">
            <MGrid>
              <MField label="Days" colSpan={2}>
                <div style={{ display: "flex", gap: 6 }}>
                  {DAYS.map(d => {
                    const on = activeDays.includes(d)
                    return (
                      <button key={d} type="button" onClick={() => toggleDay(d)} style={{
                        padding: "7px 12px", borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: "pointer",
                        border: `1px solid ${on ? "#7FA06A" : "var(--kh-border)"}`,
                        background: on ? "#EAF3EC" : "var(--kh-bg)",
                        color: on ? "#2E5E3A" : "var(--kh-ink-400)",
                      }}>{d}</button>
                    )
                  })}
                </div>
              </MField>
              <MField label="Opens">
                <MInput type="time" value={form.starts_at} onChange={e => set("starts_at", e.target.value)} />
              </MField>
              <MField label="Closes">
                <MInput type="time" value={form.ends_at} onChange={e => set("ends_at", e.target.value)} />
              </MField>
            </MGrid>
          </MSection>

          <MSection idx="03" title="Staffing">
            <MGrid>
              <MField label="Lead teacher" required>
                <MSelect value={form.lead_user_id} onChange={e => set("lead_user_id", e.target.value)} required>
                  <option value="">Select lead</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} {u.lastname}</option>)}
                </MSelect>
              </MField>
              <MField label="Assistant">
                <MSelect value={form.assistant_user_id} onChange={e => set("assistant_user_id", e.target.value)}>
                  <option value="">Select assistant</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} {u.lastname}</option>)}
                </MSelect>
              </MField>
            </MGrid>
          </MSection>

          {error && <p style={{ fontSize: 12.5, color: "#D2592F", marginTop: 8 }}>{error}</p>}
        </form>
      </Modal>
    </>
  )
}
