"use client"

import { RESOURCES, PERMISSION_LEVELS, type PermissionLevel, type ResourceKey } from "@/lib/permissions/resources"
import type { RoleWithPermissions } from "@/app/api/modules/roles/roles.types"

export const LEVEL_STYLE: Record<PermissionLevel, { bg: string; color: string; dot: string; label: string }> = {
  full:     { bg: "#EAF3EC", color: "#2E5E3A", dot: "#6BA07C", label: "Full" },
  edit:     { bg: "#FEF0E8", color: "#7A3318", dot: "#E8866A", label: "Edit" },
  view:     { bg: "#FEF7E0", color: "#6B5A10", dot: "#C9AE4E", label: "View" },
  own_only: { bg: "#FCEEF0", color: "#7A303A", dot: "#D97F8C", label: "Own only" },
  none:     { bg: "#F5F3EF", color: "#9E968A", dot: "transparent", label: "—" },
}

export function permissionSummary(permissions: { level: PermissionLevel }[]): string {
  const counts: Record<PermissionLevel, number> = { full: 0, edit: 0, view: 0, own_only: 0, none: 0 }
  for (const p of permissions) counts[p.level]++
  const parts: string[] = []
  if (counts.full) parts.push(`${counts.full} full`)
  if (counts.edit) parts.push(`${counts.edit} edit`)
  if (counts.view) parts.push(`${counts.view} view`)
  if (counts.own_only) parts.push(`${counts.own_only} own only`)
  return parts.length > 0 ? parts.join(" · ") : "No access configured"
}

function LevelBadge({ level }: { level: PermissionLevel }) {
  const s = LEVEL_STYLE[level]
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 8px", borderRadius: 6,
      background: s.bg, color: s.color,
      fontSize: 10.5, fontWeight: 500, whiteSpace: "nowrap",
    }}>
      {s.dot !== "transparent" && <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />}
      {s.label}
    </span>
  )
}

function LevelCell({
  roleId, resource, level, editable, onChange,
}: {
  roleId: string
  resource: ResourceKey
  level: PermissionLevel
  editable: boolean
  onChange?: (roleId: string, resource: ResourceKey, level: PermissionLevel) => void
}) {
  if (!editable) return <LevelBadge level={level} />

  return (
    <select
      value={level}
      onChange={e => onChange?.(roleId, resource, e.target.value as PermissionLevel)}
      style={{
        border: "1px solid var(--kh-border)", borderRadius: 6, padding: "3px 6px",
        fontSize: 11, background: LEVEL_STYLE[level].bg, color: LEVEL_STYLE[level].color,
        fontWeight: 500, cursor: "pointer", outline: "none",
      }}
    >
      {PERMISSION_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
    </select>
  )
}

export function PermissionMatrix({
  roles, editable = false, onChange,
}: {
  roles: RoleWithPermissions[]
  editable?: boolean
  onChange?: (roleId: string, resource: ResourceKey, level: PermissionLevel) => void
}) {
  function levelFor(role: RoleWithPermissions, resource: ResourceKey): PermissionLevel {
    return role.permissions.find(p => p.resource === resource)?.level ?? "none"
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="kh-table" style={{ minWidth: "100%" }}>
        <thead>
          <tr>
            <th>Resource</th>
            {roles.map(r => (
              <th key={r.id} style={{ textAlign: "center", whiteSpace: "nowrap", fontSize: 11 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: r.color ?? "var(--kh-ink-300)", flexShrink: 0 }} />
                  {r.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RESOURCES.map(res => (
            <tr key={res.key}>
              <td style={{ fontWeight: 500, color: "var(--kh-ink-800)", whiteSpace: "nowrap", fontSize: 12.5 }}>{res.label}</td>
              {roles.map(role => (
                <td key={role.id} style={{ textAlign: "center" }}>
                  <LevelCell
                    roleId={role.id}
                    resource={res.key}
                    level={levelFor(role, res.key)}
                    editable={editable && !role.is_owner_role}
                    onChange={onChange}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", gap: 14, padding: "12px 2px 0", fontSize: 11, color: "var(--kh-ink-500)", flexWrap: "wrap" }}>
        {(["full", "edit", "view", "own_only"] as PermissionLevel[]).map(level => (
          <span key={level} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: LEVEL_STYLE[level].dot, flexShrink: 0 }} />
            {LEVEL_STYLE[level].label}
            {level === "full" && " — create, edit, delete"}
            {level === "edit" && " — modify only"}
            {level === "view" && " — read only"}
            {level === "own_only" && " — scoped to their own records"}
          </span>
        ))}
      </div>
    </div>
  )
}
