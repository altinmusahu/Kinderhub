"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, X, Check, ShieldCheck } from "lucide-react"
import { Spinner } from "@/components/ui/Spinner"
import { PermissionMatrix, permissionSummary } from "./PermissionMatrix"
import type { RoleWithPermissions } from "@/app/api/modules/roles/roles.types"
import type { PermissionLevel, ResourceKey } from "@/lib/permissions/resources"

const SWATCHES = ["#8B5CF6", "#F59E0B", "#3B82F6", "#10B981", "#6B7280", "#D2592F", "#D97F8C", "#8FB7C9"]

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid var(--kh-border)", borderRadius: 8,
  padding: "9px 12px", fontSize: 13, background: "var(--kh-paper)",
  color: "var(--kh-ink-800)", outline: "none", boxSizing: "border-box",
}

function AddRoleModal({ onClose, onCreated }: { onClose: () => void; onCreated: (role: RoleWithPermissions) => void }) {
  const [name, setName] = useState("")
  const [color, setColor] = useState(SWATCHES[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? "Failed to create role.")
      }
      const role = await res.json()
      onCreated({ ...role, permissions: [] })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(42,32,24,0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: "var(--kh-surface)", borderRadius: 18, width: "100%", maxWidth: 400, boxShadow: "0 24px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", borderBottom: "1px solid var(--kh-ink-100)" }}>
          <div>
            <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 20, color: "var(--kh-ink-900)" }}>Add role</div>
            <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginTop: 2 }}>New roles start with no access — set permissions after creating</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--kh-ink-100)", background: "var(--kh-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-ink-500)" }}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>
                Role name<span style={{ color: "var(--kh-peach)", marginLeft: 2 }}>*</span>
              </label>
              <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle} placeholder="e.g. Finance" autoFocus />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>Color</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SWATCHES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: 26, height: 26, borderRadius: "50%", background: c, cursor: "pointer",
                      border: color === c ? "2px solid var(--kh-ink-900)" : "2px solid transparent",
                      boxShadow: color === c ? "0 0 0 2px var(--kh-surface)" : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ margin: "0 20px 8px", padding: "8px 12px", background: "var(--kh-pink-bg)", borderRadius: 8, fontSize: 12, color: "var(--kh-pink-d)" }}>
              {error}
            </div>
          )}

          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--kh-ink-100)", display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "1px solid var(--kh-ink-200)", background: "var(--kh-bg)", color: "var(--kh-ink-700)", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving || !name.trim()} style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: (saving || !name.trim()) ? "not-allowed" : "pointer", background: (saving || !name.trim()) ? "var(--kh-ink-200)" : "var(--kh-peach)", color: (saving || !name.trim()) ? "var(--kh-ink-400)" : "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}>
              {saving && <Spinner size="sm" />}
              {saving ? "Creating…" : "Add role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RolesSettingsPage() {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([])
  const [loading, setLoading] = useState(true)
  const [myRoleId, setMyRoleId] = useState<string | null>(null)
  const [dirtyRoleIds, setDirtyRoleIds] = useState<Set<string>>(new Set())
  const [showAddRole, setShowAddRole] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [confirmSettingsWipe, setConfirmSettingsWipe] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/roles").then(r => r.json()),
      fetch("/api/auth/me").then(r => r.json()),
    ]).then(([rolesData, me]) => {
      setRoles(Array.isArray(rolesData) ? rolesData : [])
      setMyRoleId(me?.role_id ?? null)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const myRole = useMemo(() => roles.find(r => r.id === myRoleId) ?? null, [roles, myRoleId])
  const mySettingsLevel = myRole?.permissions.find(p => p.resource === "settings")?.level ?? "none"
  const canManageRoles = mySettingsLevel === "full"

  function handleCellChange(roleId: string, resource: ResourceKey, level: PermissionLevel) {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r
      const existing = r.permissions.find(p => p.resource === resource)
      const nextPermissions = existing
        ? r.permissions.map(p => p.resource === resource ? { ...p, level } : p)
        : [...r.permissions, { id: "", tenant_id: r.tenant_id, role_id: roleId, resource, level, updated_at: "" }]
      return { ...r, permissions: nextPermissions }
    }))
    setDirtyRoleIds(prev => new Set(prev).add(roleId))
  }

  function wouldLeaveSettingsUnmanaged(): boolean {
    return !roles.some(r => !r.is_owner_role && (r.permissions.find(p => p.resource === "settings")?.level ?? "none") === "full")
  }

  async function persistSave() {
    setSaving(true)
    setError("")
    try {
      for (const roleId of dirtyRoleIds) {
        const role = roles.find(r => r.id === roleId)
        if (!role) continue
        const res = await fetch(`/api/roles/${roleId}/permissions`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(role.permissions.map(p => ({ resource: p.resource, level: p.level }))),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.error ?? "Failed to save permissions.")
        }
      }
      setDirtyRoleIds(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSaving(false)
      setConfirmSettingsWipe(false)
    }
  }

  function handleSaveClick() {
    if (wouldLeaveSettingsUnmanaged()) {
      setConfirmSettingsWipe(true)
      return
    }
    persistSave()
  }

  function handleRoleCreated(role: RoleWithPermissions) {
    setRoles(prev => [...prev, role])
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 260, color: "var(--kh-ink-400)", gap: 10 }}>
        <Spinner size="md" />
        <span style={{ fontSize: 13 }}>Loading roles…</span>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="kh-h1">Roles &amp; permissions</h1>
          <p className="kh-sub" style={{ margin: 0 }}>Define what each role can see and do across Kinderhub.</p>
        </div>
        {dirtyRoleIds.size > 0 && (
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={saving}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600,
              border: "none", cursor: saving ? "not-allowed" : "pointer",
              background: saving ? "var(--kh-ink-200)" : "var(--kh-peach)", color: "#fff",
            }}
          >
            {saving ? <Spinner size="sm" /> : <Check size={14} />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        )}
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--kh-pink-bg)", borderRadius: 9, fontSize: 12.5, color: "var(--kh-pink-d)" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(200px,1fr) 3fr", gap: 14 }}>
        {/* Roles list */}
        <div className="kh-card">
          <div className="kh-card-header">
            <span className="kh-card-title">Roles</span>
            <span className="kh-card-meta">{roles.length} defined</span>
          </div>
          <div style={{ padding: "0 8px 12px" }}>
            {roles.map(r => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderTop: "1px solid var(--kh-border)" }}>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: r.color ?? "var(--kh-ink-300)", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontWeight: 600, color: "var(--kh-ink-900)", fontSize: 12.5 }}>{r.name}</div>
                    {r.is_owner_role && (
                      <span className="kh-status-badge" style={{ background: "var(--kh-ink-50)", color: "var(--kh-ink-500)", fontSize: 10 }}>owner</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--kh-ink-500)", marginTop: 1 }}>{permissionSummary(r.permissions)}</div>
                </div>
              </div>
            ))}
          </div>
          {canManageRoles && (
            <div style={{ padding: "0 8px 10px" }}>
              <button
                type="button"
                onClick={() => setShowAddRole(true)}
                style={{
                  width: "100%", padding: "10px 10px", borderRadius: 10, textAlign: "left", cursor: "pointer",
                  border: "1px dashed var(--kh-ink-300)", background: "transparent",
                  display: "flex", alignItems: "center", gap: 8,
                  color: "var(--kh-ink-500)", fontSize: 13,
                }}
              >
                <Plus size={14} /> Add role
              </button>
            </div>
          )}
        </div>

        {/* Permission matrix */}
        <div className="kh-card" style={{ overflow: "hidden" }}>
          <div className="kh-card-header">
            <span className="kh-card-title">What each role can access</span>
            <span className="kh-card-meta" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <ShieldCheck size={11} /> permission matrix
            </span>
          </div>
          <div style={{ padding: "4px 14px 14px" }}>
            <PermissionMatrix
              roles={roles}
              editable={canManageRoles}
              onChange={handleCellChange}
            />
          </div>
        </div>
      </div>

      {showAddRole && (
        <AddRoleModal onClose={() => setShowAddRole(false)} onCreated={handleRoleCreated} />
      )}

      {confirmSettingsWipe && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(42,32,24,0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmSettingsWipe(false) }}
        >
          <div style={{ background: "var(--kh-surface)", borderRadius: 18, width: "100%", maxWidth: 400, boxShadow: "0 24px 60px rgba(0,0,0,0.18)", padding: "24px 22px" }}>
            <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 19, color: "var(--kh-ink-900)", marginBottom: 8 }}>Are you sure?</div>
            <p style={{ fontSize: 13, color: "var(--kh-ink-600)", margin: "0 0 20px" }}>
              No other role will be able to manage Roles &amp; Permissions after this change. Only the Owner role will retain access.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setConfirmSettingsWipe(false)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "1px solid var(--kh-ink-200)", background: "var(--kh-bg)", color: "var(--kh-ink-700)", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="button" onClick={persistSave} disabled={saving} style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: saving ? "not-allowed" : "pointer", background: saving ? "var(--kh-ink-200)" : "#C0392B", color: saving ? "var(--kh-ink-400)" : "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}>
                {saving && <Spinner size="sm" />}
                {saving ? "Saving…" : "Save anyway"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
