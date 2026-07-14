"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { UserById } from "./types"
import { Field, SaveBar } from "./Field"
import { WorkHistoryModal } from "./WorkHistoryModal"
import { KhTooltip } from "@/components/ui/KhTooltip"
import { permissionSummary } from "@/app/dashboard/settings/roles/PermissionMatrix"
import type { RoleWithPermissions } from "@/app/api/modules/roles/roles.types"

export function EmploymentCard({ user, userId }: { user: UserById; userId: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, startSave] = useTransition()
  const [error, setError] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [roles, setRoles] = useState<RoleWithPermissions[]>([])
  const [roleId, setRoleId] = useState(user.user.role_id ?? "")
  const [canManageRoles, setCanManageRoles] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/roles").then(r => r.json()),
      fetch("/api/auth/me").then(r => r.json()),
    ]).then(([rolesData, me]) => {
      const roleList: RoleWithPermissions[] = Array.isArray(rolesData) ? rolesData : []
      setRoles(roleList)
      const myRole = roleList.find(r => r.id === me?.role_id)
      const mySettingsLevel = myRole?.permissions.find(p => p.resource === "settings")?.level ?? "none"
      setCanManageRoles(mySettingsLevel === "full")
    }).catch(() => {})
  }, [])

  const assignedRole = roles.find(r => r.id === user.user.role_id) ?? null

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body: { is_active: boolean; role_id?: string | null } = {
      is_active: fd.get("is_active") === "true",
    }
    if (canManageRoles) body.role_id = roleId || null
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
                    Status
                    <KhTooltip label="What does Inactive mean?">
                      Inactive is just a label for record-keeping — it doesn&apos;t block their login or remove them from any list. To fully remove someone, delete their profile instead.
                    </KhTooltip>
                  </span>
                  <span style={{ color: user.user.is_active ? "#3A8C50" : "var(--kh-ink-500)" }}>
                    {user.user.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div style={rowStyle}>
                  <span style={{ color: "var(--kh-ink-400)" }}>
                    Permissions role
                    <KhTooltip label="Role vs. Permissions role">
                      This is different from the "Role" job title above — it&apos;s what actually controls what this person can see and do in Kinderhub. Managed under Settings → Roles &amp; permissions.
                    </KhTooltip>
                  </span>
                  {assignedRole ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--kh-ink-800)" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: assignedRole.color ?? "var(--kh-ink-300)", flexShrink: 0 }} />
                      {assignedRole.name}
                    </span>
                  ) : (
                    <span style={{ color: "var(--kh-ink-300)" }}>Not assigned</span>
                  )}
                </div>
              </>
            ) : (
              <>
                <div style={rowStyle}>
                  <label htmlFor="is_active" style={{ color: "var(--kh-ink-400)", alignSelf: "center" }}>Status</label>
                  <select id="is_active" name="is_active" defaultValue={user.user.is_active ? "true" : "false"} style={inputStyle}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div style={rowStyle}>
                  <label htmlFor="role_id" style={{ color: "var(--kh-ink-400)", alignSelf: "center" }}>
                    Permissions role
                  </label>
                  {canManageRoles ? (
                    <select id="role_id" name="role_id" value={roleId} onChange={e => setRoleId(e.target.value)} style={inputStyle}>
                      <option value="">Not assigned</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  ) : (
                    <span style={{ color: assignedRole ? "var(--kh-ink-800)" : "var(--kh-ink-300)", alignSelf: "center" }}>
                      {assignedRole?.name ?? "Not assigned"}
                    </span>
                  )}
                </div>
                {canManageRoles && roleId && (
                  <div style={{ padding: "0 0 6px", fontSize: 11.5, color: "var(--kh-ink-400)" }}>
                    {permissionSummary(roles.find(r => r.id === roleId)?.permissions ?? [])}
                  </div>
                )}
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
