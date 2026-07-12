"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { UserById } from "./types"
import { Field, SaveBar } from "./Field"

export function PersonalCard({ user, userId }: { user: UserById; userId: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, startSave] = useTransition()
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body = {
      name:            fd.get("name"),
      lastname:        fd.get("lastname"),
      email:           fd.get("email"),
      phone_number:    fd.get("phone_number"),
      personal_number: fd.get("personal_number"),
      date_of_birth:   fd.get("date_of_birth"),
      street:          (fd.get("street") as string) || null,
      house_number:    (fd.get("house_number") as string) || null,
      city:            (fd.get("city") as string) || null,
      postal_code:     (fd.get("postal_code") as string) || null,
      country:         (fd.get("country") as string) || null,
    }
    startSave(async () => {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) { setEditing(false); setError(""); router.refresh() }
      else setError("Failed to save. Please try again.")
    })
  }

  const u = user.user
  const a = user.address

  return (
    <div className="kh-card">
      <div className="kh-card-header">
        <span className="kh-card-title">Personal Information</span>
        {!editing && (
          <button className="kh-btn" style={{ fontSize: 12 }} onClick={() => setEditing(true)}>Edit</button>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ padding: "4px 18px 4px" }}>
          <Field label="First name"    name="name"            value={u.name}                   disabled={!editing} />
          <Field label="Last name"     name="lastname"        value={u.lastname}                disabled={!editing} />
          <Field label="Email"         name="email"           value={u.email}       type="email" disabled={!editing} />
          <Field label="Phone"         name="phone_number"    value={u.phone_number || ""}      disabled={!editing} />
          <Field label="Personal No."  name="personal_number" value={u.personal_number || ""}   disabled={!editing} />
          <Field label="Date of birth" name="date_of_birth"   value={u.date_of_birth || ""} type="date" disabled={!editing} />
          <Field label="Street"        name="street"          value={a?.street || ""}       disabled={!editing} />
          <Field label="House No."     name="house_number"    value={a?.house_number || ""} disabled={!editing} />
          <Field label="City"          name="city"            value={a?.city || ""}         disabled={!editing} />
          <Field label="Postal code"   name="postal_code"     value={a?.postal_code || ""}  disabled={!editing} />
          <Field label="Country"       name="country"         value={a?.country || ""}      disabled={!editing} />
        </div>
        {error && <p style={{ padding: "0 18px", fontSize: 12, color: "#D2592F" }}>{error}</p>}
        {editing && <SaveBar saving={saving} onCancel={() => { setEditing(false); setError("") }} />}
      </form>
    </div>
  )
}
