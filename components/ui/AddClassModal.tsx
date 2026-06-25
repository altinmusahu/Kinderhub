"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Modal, MField, MSection, MGrid, MInput, MSelect, MBtn } from "./Modal"

type User = { id: string; name: string; lastname: string }
type Location = { id: string; name: string }

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const
type Day = typeof ALL_DAYS[number]

type DaySchedule = { opens: string; closes: string }
type Schedule = Partial<Record<Day, DaySchedule>>

const DEFAULT_TIME = { opens: "08:00", closes: "17:30" }

export default function AddClassModal({ triggerLabel = "+ New class" }: { triggerLabel?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, startSave] = useTransition()
  const [error, setError] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  // Which days are active
  const [activeDays, setActiveDays] = useState<Day[]>(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])

  // Per-day schedule
  const [schedule, setSchedule] = useState<Schedule>({
    Monday: { ...DEFAULT_TIME },
    Tuesday: { ...DEFAULT_TIME },
    Wednesday: { ...DEFAULT_TIME },
    Thursday: { ...DEFAULT_TIME },
    Friday: { ...DEFAULT_TIME },
  })

  // "Apply all" global time
  const [globalOpens, setGlobalOpens] = useState("08:00")
  const [globalCloses, setGlobalCloses] = useState("17:30")

  const [form, setForm] = useState({
    name: "", average_year: "", location_id: "",
    capacity: "", lead_user_id: "", assistant_user_id: "",
  })

  useEffect(() => {
    if (!open) return
    fetch("/api/users").then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : [])).catch(() => {})
    fetch("/api/locations").then(r => r.json()).then(d => setLocations(Array.isArray(d) ? d : [])).catch(() => {})
  }, [open])

  function setField(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function toggleDay(day: Day) {
    setActiveDays(prev => {
      if (prev.includes(day)) return prev.filter(d => d !== day)
      // add with default times if not already in schedule
      setSchedule(s => ({ ...s, [day]: s[day] ?? { ...DEFAULT_TIME } }))
      return [...prev, day]
    })
  }

  function setDayTime(day: Day, field: "opens" | "closes", value: string) {
    setSchedule(s => ({ ...s, [day]: { ...s[day]!, [field]: value } }))
  }

  function applyToAll() {
    const updated: Schedule = {}
    for (const day of activeDays) {
      updated[day] = { opens: globalOpens, closes: globalCloses }
    }
    setSchedule(s => ({ ...s, ...updated }))
  }

  function close() {
    setOpen(false)
    setError("")
    setForm({ name: "", average_year: "", location_id: "", capacity: "", lead_user_id: "", assistant_user_id: "" })
    setActiveDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])
    setSchedule({ Monday: { ...DEFAULT_TIME }, Tuesday: { ...DEFAULT_TIME }, Wednesday: { ...DEFAULT_TIME }, Thursday: { ...DEFAULT_TIME }, Friday: { ...DEFAULT_TIME } })
    setGlobalOpens("08:00")
    setGlobalCloses("17:30")
  }

  function buildScheduleJson(): Schedule {
    const result: Schedule = {}
    for (const day of activeDays) {
      result[day] = schedule[day] ?? { ...DEFAULT_TIME }
    }
    return result
  }

  // Derive starts_at / ends_at from the earliest open and latest close across active days
  function deriveStartsEnds() {
    const times = activeDays.map(d => schedule[d] ?? DEFAULT_TIME)
    const opens = times.map(t => t.opens).sort()
    const closes = times.map(t => t.closes).sort()
    return {
      starts_at: opens[0] ?? DEFAULT_TIME.opens,
      ends_at: closes[closes.length - 1] ?? DEFAULT_TIME.closes,
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (activeDays.length === 0) {
      setError("Select at least one day.")
      return
    }

    startSave(async () => {
      const { starts_at, ends_at } = deriveStartsEnds()
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:               form.name,
          average_year:       form.average_year,
          location_id:        form.location_id,
          starts_at,
          ends_at,
          capacity:           parseInt(form.capacity),
          lead_user_id:       form.lead_user_id,
          assistant_user_id:  form.assistant_user_id || null,
          schedule:           buildScheduleJson(),
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
        width={660}
        footer={
          <>
            <MBtn variant="ghost" onClick={close}>Cancel</MBtn>
            <MBtn
              variant="accent"
              type="submit"
              disabled={saving}
              onClick={() => (document.getElementById("add-class-form") as HTMLFormElement)?.requestSubmit()}
            >
              {saving ? "Creating…" : "Create class"}
            </MBtn>
          </>
        }
      >
        <form id="add-class-form" onSubmit={handleSubmit} style={{ padding: "18px 22px 6px" }}>

          {/* ── 01 Class details ── */}
          <MSection idx="01" title="Class details">
            <MGrid>
              <MField label="Class name" required>
                <MInput value={form.name} onChange={e => setField("name", e.target.value)} placeholder="e.g. Willow" required autoFocus />
              </MField>
              <MField label="Age range" required hint="Shown to families">
                <MInput value={form.average_year} onChange={e => setField("average_year", e.target.value)} placeholder="e.g. 2–3 yr" required />
              </MField>
              <MField label="Location" required>
                <MSelect value={form.location_id} onChange={e => setField("location_id", e.target.value)} required>
                  <option value="">Select location</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </MSelect>
              </MField>
              <MField label="Capacity" required>
                <MInput type="number" value={form.capacity} onChange={e => setField("capacity", e.target.value)} suf="children" placeholder="12" required />
              </MField>
            </MGrid>
          </MSection>

          {/* ── 02 Schedule ── */}
          <MSection idx="02" title="Schedule">

            {/* Day toggles */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {ALL_DAYS.map(day => {
                const on = activeDays.includes(day)
                const short = day.slice(0, 3)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    style={{
                      padding: "6px 11px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                      cursor: "pointer", transition: "all 120ms",
                      border: `1px solid ${on ? "#7FA06A" : "var(--kh-border)"}`,
                      background: on ? "#EAF3EC" : "var(--kh-bg)",
                      color: on ? "#2E5E3A" : "var(--kh-ink-400)",
                    }}
                  >
                    {short}
                  </button>
                )
              })}
            </div>

            {/* Apply-all row */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 13px", borderRadius: 10,
              background: "var(--kh-ink-50)", border: "1px solid var(--kh-border)",
              marginBottom: 14,
            }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--kh-ink-600)", flexShrink: 0 }}>Apply to all active days:</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                <input
                  type="time"
                  value={globalOpens}
                  onChange={e => setGlobalOpens(e.target.value)}
                  style={{ border: "1px solid var(--kh-border)", borderRadius: 7, padding: "5px 8px", fontSize: 12.5, background: "var(--kh-surface)", fontFamily: "var(--kh-font-mono)", outline: "none" }}
                />
                <span style={{ fontSize: 12, color: "var(--kh-ink-400)" }}>–</span>
                <input
                  type="time"
                  value={globalCloses}
                  onChange={e => setGlobalCloses(e.target.value)}
                  style={{ border: "1px solid var(--kh-border)", borderRadius: 7, padding: "5px 8px", fontSize: 12.5, background: "var(--kh-surface)", fontFamily: "var(--kh-font-mono)", outline: "none" }}
                />
              </div>
              <button
                type="button"
                onClick={applyToAll}
                style={{
                  padding: "6px 13px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                  background: "#D2592F", color: "#fff", border: "none",
                  cursor: "pointer", flexShrink: 0,
                }}
              >
                Apply
              </button>
            </div>

            {/* Per-day rows */}
            {activeDays.length === 0 ? (
              <p style={{ fontSize: 12.5, color: "var(--kh-ink-400)", textAlign: "center", padding: "12px 0" }}>
                Select at least one day above.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activeDays.map(day => {
                  const s = schedule[day] ?? DEFAULT_TIME
                  return (
                    <div
                      key={day}
                      style={{
                        display: "grid", gridTemplateColumns: "120px 1fr 16px 1fr",
                        alignItems: "center", gap: 10,
                        padding: "9px 12px", borderRadius: 9,
                        background: "var(--kh-bg)", border: "1px solid var(--kh-border)",
                      }}
                    >
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--kh-ink-800)" }}>{day}</span>
                      <input
                        type="time"
                        value={s.opens}
                        onChange={e => setDayTime(day, "opens", e.target.value)}
                        style={{ border: "1px solid var(--kh-border)", borderRadius: 7, padding: "6px 9px", fontSize: 12.5, background: "var(--kh-surface)", fontFamily: "var(--kh-font-mono)", outline: "none", width: "100%" }}
                      />
                      <span style={{ fontSize: 12, color: "var(--kh-ink-400)", textAlign: "center" }}>–</span>
                      <input
                        type="time"
                        value={s.closes}
                        onChange={e => setDayTime(day, "closes", e.target.value)}
                        style={{ border: "1px solid var(--kh-border)", borderRadius: 7, padding: "6px 9px", fontSize: 12.5, background: "var(--kh-surface)", fontFamily: "var(--kh-font-mono)", outline: "none", width: "100%" }}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </MSection>

          {/* ── 03 Staffing ── */}
          <MSection idx="03" title="Staffing">
            <MGrid>
              <MField label="Lead teacher" required>
                <MSelect value={form.lead_user_id} onChange={e => setField("lead_user_id", e.target.value)} required>
                  <option value="">Select lead</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} {u.lastname}</option>)}
                </MSelect>
              </MField>
              <MField label="Assistant" optional>
                <MSelect value={form.assistant_user_id} onChange={e => setField("assistant_user_id", e.target.value)}>
                  <option value="">Select assistant</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} {u.lastname}</option>)}
                </MSelect>
              </MField>
            </MGrid>
          </MSection>

          {error && <p style={{ fontSize: 12.5, color: "#D2592F", marginTop: 4, marginBottom: 10 }}>{error}</p>}
        </form>
      </Modal>
    </>
  )
}
