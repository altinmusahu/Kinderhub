"use client"

import { useState, useTransition } from "react"
import type { UserById } from "./types"
import { Field, SaveBar } from "./Field"
import { WorkHistoryModal } from "./WorkHistoryModal"
import { KhTooltip } from "@/components/ui/KhTooltip"

export function EmploymentCard({ user, userId }: { user: UserById; userId: string }) {
  const [editing, setEditing] = useState(false)
  const [saving, startSave] = useTransition()
  const [error, setError] = useState("")
  const [showHistory, setShowHistory] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  const rowStyle: React.CSSProperties = {
    display: "grid", gridTemplateColumns: "140px 1fr", gap: 10,
    padding: "9px 0", borderTop: "1px solid var(--kh-border-soft)", fontSize: 12.5,
  }
  const inputStyle: React.CSSProperties = {
    background: "var(--kh-ink-50)", border: "1px solid var(--kh-border)",
    borderRadius: 6, padding: "5px 9px", fontSize: 12.5,
    fontFamily: "inherit", outline: "none", width: "100%",
  }

  return (
    <>
      {showHistory && <WorkHistoryModal userId={userId} onClose={() => setShowHistory(false)} />}

      <div className="kh-card">
        <div className="kh-card-header">
          <span className="kh-card-title">Employment</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="kh-btn" style={{ fontSize: 12 }} onClick={() => setShowHistory(true)}>
              History
            </button>
            {!editing && (
              <button className="kh-btn" style={{ fontSize: 12 }} onClick={() => setEditing(true)}>
                Edit
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: "4px 18px 4px" }}>
            <Field label="Company"    name="_company"    value={user.tenant_name    ?? "—"} disabled />
            <Field label="Department" name="_department" value={user.department_name ?? "—"} disabled />
            <Field label="Position"   name="_position"   value={user.position_name  ?? "—"} disabled />
            <Field label="Start date" name="_start_date" value={user.start_date     ?? "—"} disabled />

            {!editing ? (
              <>
                <div style={rowStyle}>
                  <span style={{ color: "var(--kh-ink-400)" }}>
                    Role
                    <KhTooltip label="What is Role?">
                      The staff member's job title at this location, e.g. Admin, Director, Lead teacher, Assistant, or Staff.
                    </KhTooltip>
                  </span>
                  <span style={{ color: "var(--kh-ink-800)" }}>{user.user.role || "—"}</span>
                </div>
                <div style={rowStyle}>
                  <span style={{ color: "var(--kh-ink-400)" }}>
                    Status
                    <KhTooltip label="What does Inactive mean?">
                      Inactive is just a label for record-keeping — it doesn't block their login or remove them from any list. To fully remove someone, delete their profile instead.
                    </KhTooltip>
                  </span>
                  <span style={{ color: user.user.is_active ? "#3A8C50" : "var(--kh-ink-500)" }}>
                    {user.user.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div style={rowStyle}>
                  <label htmlFor="role" style={{ color: "var(--kh-ink-400)", alignSelf: "center" }}>
                    Role
                    <KhTooltip label="What is Role?">
                      The staff member's job title at this location, e.g. Admin, Director, Lead teacher, Assistant, or Staff.
                    </KhTooltip>
                  </label>
                  <input id="role" name="role" defaultValue={user.user.role || ""} style={inputStyle} />
                </div>
                <div style={rowStyle}>
                  <label htmlFor="is_active" style={{ color: "var(--kh-ink-400)", alignSelf: "center" }}>Status</label>
                  <select id="is_active" name="is_active" defaultValue={user.user.is_active ? "true" : "false"} style={inputStyle}>
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
    </>
  )
}
