"use client"

import { useState, useTransition } from "react"
import type { UserById } from "./types"
import { Field, SaveBar } from "./Field"

export function PersonalCard({ user, userId }: { user: UserById; userId: string }) {
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
        </div>
        {error && <p style={{ padding: "0 18px", fontSize: 12, color: "#D2592F" }}>{error}</p>}
        {editing && <SaveBar saving={saving} onCancel={() => { setEditing(false); setError("") }} />}
      </form>
    </div>
  )
}
