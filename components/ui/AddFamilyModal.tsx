"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Modal, MField, MSection, MInput, MSelect, MToggle, MGrid, MBtn } from "./Modal"

const STEPS = [
  { t: "Family",    d: "Plan & status" },
  { t: "Guardians", d: "Parents & pickup" },
  { t: "Children",  d: "Kids & rooms" },
  { t: "Class",     d: "Enroll or waitlist" },
  { t: "Review",    d: "Confirm & create" },
]

type Guardian = { firstname: string; lastname: string; phone_number: string; address: string; pick_up: boolean; personal_number: string; date_of_birth: string }
type Kid = { firstname: string; lastname: string; date_of_birth: string; gender: string; personal_number: string }
type ClassOption = { id: string; name: string; average_year: string; capacity: number; enrolled: number; lead_name: string | null; location_name: string | null }
// Per-kid class assignment: class_id chosen, and whether it goes to waitlist
type KidAssignment = { class_id: string; waitlist: boolean; note: string }

const emptyGuardian = (): Guardian => ({ firstname: "", lastname: "", phone_number: "", address: "", pick_up: false, personal_number: "", date_of_birth: "" })
const emptyKid = (): Kid => ({ firstname: "", lastname: "", date_of_birth: "", gender: "", personal_number: "" })
const emptyAssignment = (): KidAssignment => ({ class_id: "", waitlist: false, note: "" })

function StepRail({ active }: { active: number }) {
  return (
    <div style={{ borderRight: "1px solid var(--kh-border)", background: "var(--kh-ink-50)", padding: "16px 12px", flexShrink: 0, width: 200 }}>
      <div style={{ fontSize: 10.5, fontFamily: "var(--kh-font-mono)", color: "var(--kh-ink-400)", textTransform: "uppercase", letterSpacing: ".08em", padding: "0 12px 10px" }}>New family</div>
      {STEPS.map((s, i) => {
        const done = i < active, cur = i === active
        return (
          <div key={s.t} style={{
            display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", borderRadius: 9,
            background: cur ? "var(--kh-surface)" : "transparent",
            color: done ? "var(--kh-ink-700)" : cur ? "var(--kh-ink-900)" : "var(--kh-ink-400)",
            marginBottom: 2,
          }}>
            <span style={{
              width: 24, height: 24, minWidth: 24, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--kh-font-mono)", fontSize: 11,
              border: `1.5px solid ${done ? "#7FA06A" : cur ? "#D2592F" : "var(--kh-border)"}`,
              background: done ? "#7FA06A" : cur ? "#D2592F" : "transparent",
              color: (done || cur) ? "#fff" : "var(--kh-ink-400)",
            }}>
              {done ? "✓" : i + 1}
            </span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>
              {s.t}<br />
              <span style={{ fontSize: 11, fontWeight: 400, color: "var(--kh-ink-400)" }}>{s.d}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

function CapacityBar({ enrolled, capacity }: { enrolled: number; capacity: number }) {
  const pct = capacity > 0 ? Math.min(enrolled / capacity, 1) : 0
  const full = enrolled >= capacity
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 5, background: "var(--kh-ink-100)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct * 100}%`, background: full ? "#D2592F" : "#7FA06A", borderRadius: 99, transition: "width .3s" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, fontFamily: "var(--kh-font-mono)", color: full ? "#D2592F" : "var(--kh-ink-400)" }}>
        <span>{enrolled} / {capacity} enrolled</span>
        <span>{full ? "Full" : `${capacity - enrolled} spot${capacity - enrolled !== 1 ? "s" : ""} open`}</span>
      </div>
    </div>
  )
}

export default function AddFamilyModal({ triggerLabel = "+ Add family" }: { triggerLabel?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [saving, startSave] = useTransition()
  const [error, setError] = useState("")

  const [family, setFamily] = useState({ name: "", status: "Active", plan: "Full-time", balance: "0" })
  const [guardians, setGuardians] = useState<Guardian[]>([emptyGuardian()])
  const [kids, setKids] = useState<Kid[]>([emptyKid()])
  const [assignments, setAssignments] = useState<KidAssignment[]>([emptyAssignment()])

  // Classes fetched when reaching step 3
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [classesLoading, setClassesLoading] = useState(false)

  // Sync assignments length to kids length
  useEffect(() => {
    setAssignments(prev => {
      const next = [...prev]
      while (next.length < kids.length) next.push(emptyAssignment())
      return next.slice(0, kids.length)
    })
  }, [kids.length])

  // Load classes when entering step 3
  useEffect(() => {
    if (step !== 3) return
    if (classes.length > 0) return
    setClassesLoading(true)
    fetch("/api/classes/with-enrollment")
      .then(r => r.json())
      .then(d => setClasses(Array.isArray(d) ? d : []))
      .catch(() => setClasses([]))
      .finally(() => setClassesLoading(false))
  }, [step, classes.length])

function close() {
    setOpen(false); setStep(0); setError("")
    setFamily({ name: "", status: "Active", plan: "Full-time", balance: "0" })
    setGuardians([emptyGuardian()])
    setKids([emptyKid()])
    setAssignments([emptyAssignment()])
    setClasses([])
  }

  function setG(i: number, k: keyof Guardian, v: string | boolean) {
    setGuardians(gs => gs.map((g, idx) => idx === i ? { ...g, [k]: v } : g))
  }
  function setK(i: number, k: keyof Kid, v: string) {
    setKids(ks => ks.map((k2, idx) => idx === i ? { ...k2, [k]: v } : k2))
  }
  function setA(i: number, k: keyof KidAssignment, v: string | boolean) {
    setAssignments(as => as.map((a, idx) => idx === i ? { ...a, [k]: v } : a))
  }

  // When user picks a class, auto-detect if it's full and pre-set waitlist
  function pickClass(kidIdx: number, classId: string) {
    const cls = classes.find(c => c.id === classId)
    const isFull = cls ? cls.enrolled >= cls.capacity : false
    setAssignments(as => as.map((a, idx) => idx === kidIdx ? { ...a, class_id: classId, waitlist: isFull } : a))
  }

  function handleSubmit() {
    setError("")
    startSave(async () => {
      // Step 1: create family
      const famRes = await fetch("/api/families", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: family.name, status: family.status, plan: family.plan, balance: parseFloat(family.balance) || 0 }),
      })
      if (!famRes.ok) { setError("Failed to create family."); return }
      const fam = await famRes.json()

      // Step 2: create guardians
      for (const g of guardians) {
        if (!g.firstname) continue
        const res = await fetch("/api/parents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            family_id: fam.id, firstname: g.firstname, lastname: g.lastname,
            phone_number: g.phone_number, personal_number: g.personal_number,
            date_of_birth: g.date_of_birth, address: g.address,
            pick_up: g.pick_up, is_active: true,
          }),
        })
        if (!res.ok) { setError("Failed to create guardian."); return }
      }

      // Step 3: create kids + enroll or waitlist
      for (let i = 0; i < kids.length; i++) {
        const k = kids[i]
        if (!k.firstname) continue

        const kidRes = await fetch("/api/kids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            family_id: fam.id, firstname: k.firstname, lastname: k.lastname,
            date_of_birth: k.date_of_birth, gender: k.gender || "Other",
            personal_number: k.personal_number || null,
          }),
        })
        if (!kidRes.ok) { setError("Failed to create child."); return }
        const createdKid = await kidRes.json()

        const a = assignments[i]
        if (!a?.class_id) continue

        if (a.waitlist) {
          // Add to waitlist using the created kid's id
          const wRes = await fetch(`/api/waitlist/${a.class_id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kid_id: createdKid.id }),
          })
          if (!wRes.ok) { setError(`Failed to add ${k.firstname} to waitlist.`); return }
        } else {
          // Enroll directly
          const eRes = await fetch(`/api/kids/${a.class_id}/kids/${createdKid.id}`, { method: "PUT" })
          if (!eRes.ok) { setError(`Failed to enroll ${k.firstname}.`); return }
        }
      }

      close()
      router.refresh()
    })
  }

  const activeKids = kids.filter(k => k.firstname)

  const footerContent = (
    <>
      <MBtn variant="ghost" onClick={step === 0 ? close : () => setStep(s => s - 1)}>
        {step === 0 ? "Cancel" : "← Back"}
      </MBtn>
      {step < 4 && <MBtn variant="accent" onClick={() => setStep(s => s + 1)}>Continue →</MBtn>}
      {step === 4 && <MBtn variant="accent" disabled={saving} onClick={handleSubmit}>{saving ? "Creating…" : "Create family"}</MBtn>}
    </>
  )

  return (
    <>
      <button className="kh-btn kh-btn--primary" onClick={() => setOpen(true)}>{triggerLabel}</button>

      <Modal
        open={open}
        onClose={close}
        title="Add a family"
        sub={`Step ${step + 1} of 5 — ${STEPS[step].d}`}
        icon="👨‍👩‍👧"
        iconBg="#FEF0E8"
        iconColor="#B24420"
        width={780}
        footer={footerContent}
      >
        <div style={{ display: "flex", minHeight: 0 }}>
          <StepRail active={step} />

          <div style={{ flex: 1, padding: "18px 22px 6px", overflowY: "auto" }}>

            {/* Step 0: Family */}
            {step === 0 && (
              <MSection title="Family details">
                <MGrid>
                  <MField label="Family name" required colSpan={2}>
                    <MInput value={family.name} onChange={e => setFamily(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Okafor-Lind" required autoFocus />
                  </MField>
                  <MField label="Status" required>
                    <MSelect value={family.status} onChange={e => setFamily(f => ({ ...f, status: e.target.value }))}>
                      <option>Active</option><option>Waitlist</option><option>Paused</option>
                    </MSelect>
                  </MField>
                  <MField label="Plan" required>
                    <MSelect value={family.plan} onChange={e => setFamily(f => ({ ...f, plan: e.target.value }))}>
                      <option>Full-time</option><option>Part-time · MWF</option><option>Part-time · TTh</option>
                    </MSelect>
                  </MField>
                </MGrid>
              </MSection>
            )}

            {/* Step 1: Guardians */}
            {step === 1 && (
              <MSection title="Guardians & pickup" desc="At least one required">
                {guardians.map((g, i) => (
                  <div key={i} style={{
                    border: `1px solid ${i === 0 ? "#F0C4A8" : "var(--kh-border)"}`,
                    borderRadius: 13, padding: 14,
                    background: i === 0 ? "linear-gradient(180deg,#FEF0E8,var(--kh-surface) 60%)" : "var(--kh-surface)",
                    marginBottom: 11,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--kh-ink-900)" }}>
                        {g.firstname || g.lastname ? `${g.firstname} ${g.lastname}` : `Guardian ${i + 1}`}
                      </span>
                      {i === 0 && <span className="kh-status-badge" style={{ background: "#FEF0E8", color: "#B24420" }}>Primary contact</span>}
                      {i > 0 && (
                        <button type="button" style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--kh-ink-400)", background: "none", border: "none", cursor: "pointer" }}
                          onClick={() => setGuardians(gs => gs.filter((_, idx) => idx !== i))}>✕ Remove</button>
                      )}
                    </div>
                    <MGrid>
                      <MField label="First name" required><MInput value={g.firstname} onChange={e => setG(i, "firstname", e.target.value)} placeholder="First name" /></MField>
                      <MField label="Last name" required><MInput value={g.lastname} onChange={e => setG(i, "lastname", e.target.value)} placeholder="Last name" /></MField>
                      <MField label="Phone" required><MInput value={g.phone_number} onChange={e => setG(i, "phone_number", e.target.value)} placeholder="+1 (415) 555-0000" /></MField>
                      <MField label="Date of birth" required><MInput type="date" value={g.date_of_birth} onChange={e => setG(i, "date_of_birth", e.target.value)} /></MField>
                      <MField label="Personal number" required><MInput value={g.personal_number} onChange={e => setG(i, "personal_number", e.target.value)} placeholder="ID number" /></MField>
                      <MField label="Address" optional><MInput value={g.address} onChange={e => setG(i, "address", e.target.value)} placeholder="Street, city" /></MField>
                    </MGrid>
                    <div style={{ marginTop: 12 }}>
                      <MToggle on={g.pick_up} onChange={v => setG(i, "pick_up", v)} title="Authorized for pickup" desc="Can collect children" />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setGuardians(gs => [...gs, emptyGuardian()])}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 11, border: "1px dashed var(--kh-border)", borderRadius: 11, color: "var(--kh-ink-600)", fontSize: 12.5, fontWeight: 500, background: "var(--kh-ink-50)", width: "100%", cursor: "pointer" }}>
                  + Add another guardian
                </button>
              </MSection>
            )}

            {/* Step 2: Children */}
            {step === 2 && (
              <MSection title="Children" desc="At least one required">
                {kids.map((k, i) => (
                  <div key={i} style={{ border: "1px solid var(--kh-border)", borderRadius: 13, padding: 14, background: "var(--kh-surface)", marginBottom: 11 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--kh-ink-900)" }}>
                        {k.firstname || k.lastname ? `${k.firstname} ${k.lastname}` : `Child ${i + 1}`}
                      </span>
                      {i > 0 && (
                        <button type="button" style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--kh-ink-400)", background: "none", border: "none", cursor: "pointer" }}
                          onClick={() => setKids(ks => ks.filter((_, idx) => idx !== i))}>✕ Remove</button>
                      )}
                    </div>
                    <MGrid cols={3}>
                      <MField label="First name" required><MInput value={k.firstname} onChange={e => setK(i, "firstname", e.target.value)} placeholder="First name" /></MField>
                      <MField label="Last name" required><MInput value={k.lastname} onChange={e => setK(i, "lastname", e.target.value)} placeholder="Last name" /></MField>
                      <MField label="Date of birth" required><MInput type="date" value={k.date_of_birth} onChange={e => setK(i, "date_of_birth", e.target.value)} /></MField>
                      <MField label="Gender">
                        <MSelect value={k.gender} onChange={e => setK(i, "gender", e.target.value)}>
                          <option value="">Select</option><option>Boy</option><option>Girl</option><option>Other</option>
                        </MSelect>
                      </MField>
                      <MField label="Personal number" colSpan={2}>
                        <MInput value={k.personal_number} onChange={e => setK(i, "personal_number", e.target.value)} placeholder="ID number" />
                      </MField>
                    </MGrid>
                  </div>
                ))}
                <button type="button" onClick={() => setKids(ks => [...ks, emptyKid()])}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 11, border: "1px dashed var(--kh-border)", borderRadius: 11, color: "var(--kh-ink-600)", fontSize: 12.5, fontWeight: 500, background: "var(--kh-ink-50)", width: "100%", cursor: "pointer" }}>
                  + Add another child
                </button>
              </MSection>
            )}

            {/* Step 3: Class assignment */}
            {step === 3 && (
              <MSection title="Class assignment" desc="Optional — skip to enroll later">
                {classesLoading ? (
                  <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>Loading classes…</div>
                ) : classes.length === 0 ? (
                  <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>No classes found. You can enroll children later from the class detail page.</div>
                ) : (
                  activeKids.length === 0 ? (
                    <div style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>Add at least one child in the previous step.</div>
                  ) : (
                    kids.map((k, i) => {
                      if (!k.firstname) return null
                      const a = assignments[i] ?? emptyAssignment()
                      const selectedClass = classes.find(c => c.id === a.class_id)
                      const isFull = selectedClass ? selectedClass.enrolled >= selectedClass.capacity : false

                      return (
                        <div key={i} style={{ border: "1px solid var(--kh-border)", borderRadius: 13, padding: 16, background: "var(--kh-surface)", marginBottom: 12 }}>
                          {/* Kid header */}
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--kh-peach-bg)", color: "var(--kh-peach-d)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                              {k.firstname[0]}{k.lastname[0]}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 13, color: "var(--kh-ink-900)" }}>{k.firstname} {k.lastname}</span>
                            {a.waitlist && (
                              <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#FDF6E3", color: "#C88F1A", border: "1px solid #F7CC7A" }}>Waitlist</span>
                            )}
                            {a.class_id && !a.waitlist && (
                              <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#EDF5EA", color: "#5E7E4C", border: "1px solid #A6C497" }}>Enrolled</span>
                            )}
                          </div>

                          {/* Class picker */}
                          <MField label="Select class" optional>
                            <MSelect value={a.class_id} onChange={e => pickClass(i, e.target.value)}>
                              <option value="">— No class yet —</option>
                              {classes.map(c => {
                                const full = c.enrolled >= c.capacity
                                return (
                                  <option key={c.id} value={c.id}>
                                    {c.name}{c.average_year ? ` (${c.average_year})` : ""}{full ? " · FULL" : ` · ${c.capacity - c.enrolled} spot${c.capacity - c.enrolled !== 1 ? "s" : ""}`}
                                  </option>
                                )
                              })}
                            </MSelect>
                          </MField>

                          {/* Selected class detail card */}
                          {selectedClass && (
                            <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 10, background: "var(--kh-ink-50)", border: "1px solid var(--kh-border)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--kh-ink-900)" }}>{selectedClass.name}</span>
                                {selectedClass.average_year && <span style={{ fontSize: 11.5, color: "var(--kh-ink-400)" }}>{selectedClass.average_year}</span>}
                                {selectedClass.location_name && <span style={{ fontSize: 11.5, color: "var(--kh-ink-400)" }}>· {selectedClass.location_name}</span>}
                                {selectedClass.lead_name && <span style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginLeft: "auto" }}>Lead: {selectedClass.lead_name}</span>}
                              </div>
                              <CapacityBar enrolled={selectedClass.enrolled} capacity={selectedClass.capacity} />

                              {/* Waitlist toggle — always available, auto-set when full */}
                              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                                <button
                                  type="button"
                                  onClick={() => setA(i, "waitlist", !a.waitlist)}
                                  style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "7px 13px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                                    border: `1.5px solid ${a.waitlist ? "#F3B43C" : "var(--kh-border)"}`,
                                    background: a.waitlist ? "#FDF6E3" : "var(--kh-surface)",
                                    color: a.waitlist ? "#C88F1A" : "var(--kh-ink-600)",
                                    transition: "all 120ms",
                                  }}
                                >
                                  <span style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${a.waitlist ? "#F3B43C" : "var(--kh-border)"}`, background: a.waitlist ? "#F3B43C" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", transition: "all 120ms" }}>
                                    {a.waitlist ? "✓" : ""}
                                  </span>
                                  Add to waitlist{isFull ? " (class is full)" : ""}
                                </button>
                                {isFull && !a.waitlist && (
                                  <span style={{ fontSize: 11.5, color: "#D2592F" }}>Class is full — waitlist recommended</span>
                                )}
                              </div>

                              {/* Note field — shown when on waitlist */}
                              {a.waitlist && (
                                <div style={{ marginTop: 10 }}>
                                  <MField label="Note" optional>
                                    <MInput value={a.note} onChange={e => setA(i, "note", e.target.value)} placeholder="e.g. Preferred start date, special needs…" />
                                  </MField>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )
                )}
              </MSection>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <MSection title="Review & create">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    ["Family",    family.name || "—",                                                                              family.status + " · " + family.plan],
                    ["Guardians", guardians.filter(g => g.firstname).map(g => `${g.firstname} ${g.lastname}`).join(", ") || "—",  `${guardians.filter(g => g.firstname).length} guardian(s)`],
                    ["Children",  kids.filter(k => k.firstname).map(k => `${k.firstname} ${k.lastname}`).join(", ") || "—",       `${kids.filter(k => k.firstname).length} child(ren)`],
                  ].map(([label, value, meta]) => (
                    <div key={label as string} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", border: "1px solid var(--kh-border)", borderRadius: 11, background: "var(--kh-ink-50)" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--kh-ink-900)", minWidth: 90 }}>{label}</span>
                      <span style={{ fontSize: 12.5, color: "var(--kh-ink-700)", flex: 1 }}>{value}</span>
                      <span style={{ fontSize: 11.5, color: "var(--kh-ink-400)" }}>{meta}</span>
                    </div>
                  ))}

                  {/* Class assignments summary */}
                  {kids.some((k, i) => k.firstname && assignments[i]?.class_id) && (
                    <div style={{ padding: "11px 14px", border: "1px solid var(--kh-border)", borderRadius: 11, background: "var(--kh-ink-50)" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--kh-ink-900)", marginBottom: 8 }}>Class assignments</div>
                      {kids.map((k, i) => {
                        if (!k.firstname || !assignments[i]?.class_id) return null
                        const a = assignments[i]
                        const cls = classes.find(c => c.id === a.class_id)
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, marginBottom: 5 }}>
                            <span style={{ color: "var(--kh-ink-700)" }}>{k.firstname} {k.lastname}</span>
                            <span style={{ color: "var(--kh-ink-400)" }}>→</span>
                            <span style={{ color: "var(--kh-ink-800)", fontWeight: 500 }}>{cls?.name ?? a.class_id}</span>
                            <span style={{
                              fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 99,
                              background: a.waitlist ? "#FDF6E3" : "#EDF5EA",
                              color: a.waitlist ? "#C88F1A" : "#5E7E4C",
                            }}>
                              {a.waitlist ? "Waitlist" : "Enrolled"}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                {error && <p style={{ fontSize: 12.5, color: "#D2592F", marginTop: 10 }}>{error}</p>}
              </MSection>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
