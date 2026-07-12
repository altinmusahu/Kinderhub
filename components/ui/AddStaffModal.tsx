"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Modal, MField, MSection, MInput, MSelect, MToggle, MGrid, MBtn } from "./Modal"
import { DepartmentSelect } from "./DepartmentSelect"

export default function AddStaffModal({ triggerLabel = "+ Add staff" }: { triggerLabel?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, startSave] = useTransition()
  const [error, setError] = useState("")
  const [sendInvite, setSendInvite] = useState(true)

  const [form, setForm] = useState({
    name: "", lastname: "", email: "", phone_number: "",
    personal_number: "", role: "", department_id: "", position_name: "",
    is_active: true, date_of_birth: "",
    street: "", house_number: "", city: "", postal_code: "", country: "",
  })

  function set(k: string, v: string | boolean) { setForm(f => ({ ...f, [k]: v })) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    startSave(async () => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, department_id: form.department_id || null, position_name: form.position_name || null }),
      })
      if (res.ok) {
        setOpen(false)
        setForm({ name: "", lastname: "", email: "", phone_number: "", personal_number: "", role: "", department_id: "", position_name: "", is_active: true, date_of_birth: "", street: "", house_number: "", city: "", postal_code: "", country: "" })
        router.refresh()
      } else {
        const j = await res.json().catch(() => ({}))
        setError(j?.error || j?.message || "Failed to create employee.")
      }
    })
  }

  return (
    <>
      <button className="kh-btn kh-btn--primary" onClick={() => setOpen(true)}>{triggerLabel}</button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add employee"
        sub="Create a staff profile, place them in a department, and optionally invite them."
        icon="👤"
        iconBg="#EAF3EC"
        iconColor="#3A7D44"
        width={640}
        footer={
          <>
            <MBtn variant="ghost" onClick={() => setOpen(false)}>Cancel</MBtn>
            <MBtn variant="accent" type="submit" disabled={saving}
              onClick={() => (document.getElementById("add-staff-form") as HTMLFormElement)?.requestSubmit()}>
              {saving ? "Creating…" : "Create employee"}
            </MBtn>
          </>
        }
      >
        <form id="add-staff-form" onSubmit={handleSubmit} style={{ padding: "18px 22px 6px" }}>
          <MSection idx="01" title="Personal details">
            <MGrid>
              <MField label="First name" required>
                <MInput value={form.name} onChange={e => set("name", e.target.value)} placeholder="First name" required autoFocus />
              </MField>
              <MField label="Last name" required>
                <MInput value={form.lastname} onChange={e => set("lastname", e.target.value)} placeholder="Last name" required />
              </MField>
              <MField label="Work email" required colSpan={2} hint="Becomes their login.">
                <MInput type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="name@kinderhub.co" required />
              </MField>
              <MField label="Phone">
                <MInput value={form.phone_number} onChange={e => set("phone_number", e.target.value)} placeholder="+1 (415) 555-0000" />
              </MField>
              <MField label="Date of birth">
                <MInput type="date" value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} required />
              </MField>
              <MField label="Personal / ID number" optional colSpan={2}>
                <MInput value={form.personal_number} onChange={e => set("personal_number", e.target.value)} placeholder="National ID or SSN" />
              </MField>
            </MGrid>
          </MSection>

          <MSection idx="02" title="Role & placement">
            <MGrid>
              <MField label="Role" required>
                <MSelect value={form.role} onChange={e => set("role", e.target.value)} required>
                  <option value="">Select role</option>
                  <option>Admin</option>
                  <option>Director</option>
                  <option>Lead teacher</option>
                  <option>Assistant</option>
                  <option>Staff</option>
                </MSelect>
              </MField>
              <MField label="Department">
                <DepartmentSelect value={form.department_id} onChange={v => set("department_id", v)} />
              </MField>
              <MField label="Position title" optional colSpan={2} hint='Free-text label shown on schedules, e.g. "Room assistant".'>
                <MInput value={form.position_name} onChange={e => set("position_name", e.target.value)} placeholder="Room assistant · Sunbeam" />
              </MField>
            </MGrid>
          </MSection>

          <MSection idx="03" title="Address">
            <MGrid>
              <MField label="Street" optional colSpan={2}>
                <MInput value={form.street} onChange={e => set("street", e.target.value)} placeholder="Street" />
              </MField>
              <MField label="House No." optional>
                <MInput value={form.house_number} onChange={e => set("house_number", e.target.value)} placeholder="No." />
              </MField>
              <MField label="Postal code" optional>
                <MInput value={form.postal_code} onChange={e => set("postal_code", e.target.value)} placeholder="Postal code" />
              </MField>
              <MField label="City" optional>
                <MInput value={form.city} onChange={e => set("city", e.target.value)} placeholder="City" />
              </MField>
              <MField label="Country" optional>
                <MInput value={form.country} onChange={e => set("country", e.target.value)} placeholder="Country" />
              </MField>
            </MGrid>
          </MSection>

          <MSection idx="04" title="Access">
            <MToggle
              on={sendInvite}
              onChange={setSendInvite}
              title="Send portal invite"
              desc="Emails a first-login link so they can set their own password."
            />
          </MSection>

          {error && <p style={{ fontSize: 12.5, color: "#D2592F", marginTop: 8 }}>{error}</p>}
        </form>
      </Modal>
    </>
  )
}
