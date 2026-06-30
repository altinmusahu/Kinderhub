"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, X, Loader2, Building2, Users, ShieldCheck } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────────

type Department = {
  id: string
  name: string
  is_active: boolean
  location_id: string
}

type StaffMember = {
  id: string
  name: string
  lastname: string
  email: string
  is_active: boolean
  created_at: string
  department_id: string | null
  department_name: string | null
  position_name: string | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TONE_COLORS = ["#D2592F","#E8866A","#7FA06A","#D97F8C","#C9AE4E","#8FB7C9","#A07FC9","#6BA07C"]

const ROLES = [
  { name: "Owner",         scope: "Everything · billing · export",                  external: false },
  { name: "Director",      scope: "All departments · billing · messaging",           external: false },
  { name: "Lead teacher",  scope: "Own room · own families · attendance",            external: false },
  { name: "Assistant",     scope: "Own room · attendance only",                      external: false },
  { name: "Finance",       scope: "Billing · reports · no profiles",                 external: false },
  { name: "Parent portal", scope: "Own child · messages · invoices",                 external: true  },
]

const RESOURCES = ["Families","Children","Staff","Classes","Billing","Messages","Documents","Calendar","Settings"]

const MATRIX: Record<string, string[]> = {
  "Owner":          ["full","full","full","full","full","full","full","full","full"],
  "Director":       ["full","full","full","full","full","full","full","full","edit"],
  "Lead teacher":   ["view","edit","view","edit","none","edit","view","edit","none"],
  "Assistant":      ["view","view","none","view","none","view","view","view","none"],
  "Finance":        ["view","none","view","view","full","none","view","view","none"],
  "Parent portal":  ["own", "own", "none","own", "own", "own", "own", "own", "none"],
}

const CELL: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  full: { bg: "#EAF3EC", color: "#2E5E3A", dot: "#6BA07C", label: "Full"     },
  edit: { bg: "#FEF0E8", color: "#7A3318", dot: "#E8866A", label: "Edit"     },
  view: { bg: "#FEF7E0", color: "#6B5A10", dot: "#C9AE4E", label: "View"     },
  own:  { bg: "#FCEEF0", color: "#7A303A", dot: "#D97F8C", label: "Own only" },
  none: { bg: "#F5F3EF", color: "#9E968A", dot: "transparent", label: "—"   },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string, lastname: string) {
  return `${name[0] ?? ""}${lastname[0] ?? ""}`.toUpperCase()
}

function toneColor(index: number) {
  return TONE_COLORS[index % TONE_COLORS.length]
}

// ── Add Department Modal ──────────────────────────────────────────────────────

function AddDeptModal({ locations, onClose, onSaved }: {
  locations: { id: string; name: string }[]
  onClose: () => void
  onSaved: (dept: Department) => void
}) {
  const [name, setName]           = useState("")
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "")
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1px solid var(--kh-border)", borderRadius: 8,
    padding: "9px 12px", fontSize: 13, background: "var(--kh-paper)",
    color: "var(--kh-ink-800)", outline: "none", boxSizing: "border-box",
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location_id: locationId }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.message ?? j.error ?? "Failed to create department.")
      }
      onSaved(await res.json())
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
            <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 20, color: "var(--kh-ink-900)" }}>Add department</div>
            <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginTop: 2 }}>Create a new department for your team</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--kh-ink-100)", background: "var(--kh-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-ink-500)" }}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>
                Department name<span style={{ color: "var(--kh-peach)", marginLeft: 2 }}>*</span>
              </label>
              <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle} placeholder="e.g. Classroom & Care" />
            </div>
            {locations.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>
                  Location<span style={{ color: "var(--kh-peach)", marginLeft: 2 }}>*</span>
                </label>
                <select value={locationId} onChange={e => setLocationId(e.target.value)} required style={{ ...inputStyle, appearance: "none" }}>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            )}
            {locations.length === 0 && (
              <div style={{ padding: "10px 12px", background: "var(--kh-marigold-bg)", borderRadius: 8, fontSize: 12.5, color: "#8A6200", border: "1px solid #F0D080" }}>
                You need at least one location before adding a department.{" "}
                <Link href="/dashboard/settings/locations" style={{ color: "var(--kh-peach)", fontWeight: 600 }}>Add a location →</Link>
              </div>
            )}
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
            <button type="submit" disabled={saving || locations.length === 0} style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: (saving || locations.length === 0) ? "not-allowed" : "pointer", background: (saving || locations.length === 0) ? "var(--kh-ink-200)" : "var(--kh-peach)", color: (saving || locations.length === 0) ? "var(--kh-ink-400)" : "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}>
              {saving && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
              {saving ? "Saving…" : "Add department"}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const router = useRouter()

  const [departments, setDepartments] = useState<Department[]>([])
  const [staff, setStaff]             = useState<StaffMember[]>([])
  const [locations, setLocations]     = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading]         = useState(true)
  const [selectedDept, setSelectedDept] = useState<string | null>(null)
  const [showAddDept, setShowAddDept] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/departments").then(r => r.json()),
      fetch("/api/users/with-department").then(r => r.json()),
      fetch("/api/locations").then(r => r.json()),
    ]).then(([depts, users, locs]) => {
      const deptList = Array.isArray(depts) ? depts : []
      setDepartments(deptList)
      setStaff(Array.isArray(users) ? users : [])
      setLocations(Array.isArray(locs) ? locs : [])
      if (deptList.length > 0) setSelectedDept(deptList[0].id)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const activeStaff   = staff.filter(s => s.is_active)
  const inactiveStaff = staff.filter(s => !s.is_active)

  const deptStaff = selectedDept
    ? staff.filter(s => s.department_id === selectedDept)
    : staff

  const selectedDeptObj = departments.find(d => d.id === selectedDept)

  function handleDeptAdded(dept: Department) {
    setDepartments(prev => [...prev, dept])
    setSelectedDept(dept.id)
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 260, color: "var(--kh-ink-400)", gap: 10 }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 13 }}>Loading team…</span>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="kh-h1">Team &amp; access</h1>
          <p className="kh-sub" style={{ margin: 0 }}>Organize staff by department. Roles decide what each person can see.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span className="kh-status-badge" style={{ background: "#EAF3EC", color: "#2E5E3A" }}>
            <span className="kh-pill-dot" style={{ background: "#6BA07C" }} />
            {activeStaff.length} active
          </span>
          {inactiveStaff.length > 0 && (
            <span className="kh-status-badge" style={{ background: "#F0EDE8", color: "#7A7368" }}>
              {inactiveStaff.length} inactive
            </span>
          )}
          <Link
            href="/dashboard/staff"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "1px solid var(--kh-border)", background: "var(--kh-bg)", color: "var(--kh-ink-700)", textDecoration: "none" }}
          >
            <Users size={13} />
            Manage staff
          </Link>
        </div>
      </div>

      {/* ── Departments ── */}
      <div style={{ fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
        Departments · {departments.length}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10, marginBottom: 24 }}>
        {departments.map((d, i) => {
          const color      = toneColor(i)
          const deptCount  = staff.filter(s => s.department_id === d.id).length
          const isSelected = selectedDept === d.id
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedDept(isSelected ? null : d.id)}
              style={{
                padding: "13px 15px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                border: `1px solid ${isSelected ? color + "99" : "var(--kh-border)"}`,
                background: isSelected ? `linear-gradient(150deg,${color}18,var(--kh-surface) 70%)` : "var(--kh-surface)",
                boxShadow: isSelected ? `0 0 0 2px ${color}22` : "none",
                transition: "all 120ms",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--kh-ink-900)", flex: 1 }}>{d.name}</span>
                <span style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11, color: "var(--kh-ink-400)" }}>{deptCount}</span>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)" }}>
                {deptCount === 0 ? "No staff assigned" : `${deptCount} staff member${deptCount !== 1 ? "s" : ""}`}
              </div>
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => setShowAddDept(true)}
          style={{
            padding: "13px 15px", borderRadius: 12, textAlign: "left", cursor: "pointer",
            border: "1px dashed var(--kh-ink-300)", background: "transparent",
            display: "flex", alignItems: "center", gap: 8,
            color: "var(--kh-ink-500)", fontSize: 13, transition: "all 120ms",
          }}
        >
          <Plus size={14} />
          Add department
        </button>
      </div>

      {/* ── Staff table ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <div style={{ fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".08em" }}>
            {selectedDeptObj ? selectedDeptObj.name : "All staff"}
          </div>
          <div style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>{deptStaff.length} member{deptStaff.length !== 1 ? "s" : ""}</div>
        </div>
        {selectedDept && (
          <button type="button" onClick={() => setSelectedDept(null)} style={{ fontSize: 12, color: "var(--kh-ink-400)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            Show all
          </button>
        )}
      </div>

      <div className="kh-card" style={{ overflow: "hidden", marginBottom: 28 }}>
        {deptStaff.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--kh-ink-400)", fontSize: 13 }}>
            {selectedDept ? "No staff assigned to this department yet." : "No staff members found."}
            {" "}
            <Link href="/dashboard/staff" style={{ color: "var(--kh-peach)", fontWeight: 500, textDecoration: "none" }}>
              Add staff →
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="kh-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {deptStaff.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                          background: "#E8866A33", color: "#E8866A",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {initials(m.name, m.lastname)}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--kh-ink-900)", fontSize: 13 }}>{m.name} {m.lastname}</div>
                          <div style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--kh-ink-600)", fontSize: 13 }}>{m.position_name ?? "—"}</td>
                    <td style={{ fontSize: 13, color: "var(--kh-ink-600)" }}>{m.department_name ?? "—"}</td>
                    <td>
                      <span className="kh-status-badge" style={{
                        background: m.is_active ? "#EAF3EC" : "#F0EDE8",
                        color: m.is_active ? "#2E5E3A" : "#7A7368",
                      }}>
                        <span className="kh-pill-dot" style={{ background: m.is_active ? "#6BA07C" : "#9E968A" }} />
                        {m.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11.5, color: "var(--kh-ink-400)" }}>
                      {new Date(m.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/staff/${m.id}`}
                        style={{ fontSize: 12, color: "var(--kh-peach)", textDecoration: "none", fontWeight: 500 }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Roles + Permission matrix ── */}
      <div style={{ fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10, display: "flex", alignItems: "center", gap: 7 }}>
        <ShieldCheck size={11} style={{ color: "var(--kh-peach)" }} />
        Roles &amp; permissions
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(180px,1fr) 2fr", gap: 14 }}>

        {/* Roles list */}
        <div className="kh-card">
          <div className="kh-card-header">
            <span className="kh-card-title">Roles</span>
            <span className="kh-card-meta">{ROLES.length} defined</span>
          </div>
          <div style={{ padding: "0 8px 12px" }}>
            {ROLES.map((r, i) => (
              <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderTop: "1px solid var(--kh-border)" }}>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: toneColor(i), flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontWeight: 600, color: "var(--kh-ink-900)", fontSize: 12.5 }}>{r.name}</div>
                    {r.external && (
                      <span className="kh-status-badge" style={{ background: "var(--kh-ink-50)", color: "var(--kh-ink-500)", fontSize: 10 }}>external</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--kh-ink-500)", marginTop: 1 }}>{r.scope}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permission matrix */}
        <div className="kh-card" style={{ overflow: "hidden" }}>
          <div className="kh-card-header">
            <span className="kh-card-title">What each role can access</span>
            <span className="kh-card-meta">permission matrix</span>
          </div>
          <div style={{ padding: "4px 14px 14px", overflowX: "auto" }}>
            <table className="kh-table" style={{ minWidth: "100%" }}>
              <thead>
                <tr>
                  <th>Resource</th>
                  {Object.keys(MATRIX).map(k => (
                    <th key={k} style={{ textAlign: "center", whiteSpace: "nowrap", fontSize: 11 }}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RESOURCES.map((res, ri) => (
                  <tr key={res}>
                    <td style={{ fontWeight: 500, color: "var(--kh-ink-800)", whiteSpace: "nowrap", fontSize: 12.5 }}>{res}</td>
                    {Object.keys(MATRIX).map(role => {
                      const v = MATRIX[role][ri]
                      const s = CELL[v] ?? CELL.none
                      return (
                        <td key={role} style={{ textAlign: "center" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "2px 7px", borderRadius: 6,
                            background: s.bg, color: s.color,
                            fontSize: 10.5, fontWeight: 500, whiteSpace: "nowrap",
                          }}>
                            {s.dot !== "transparent" && (
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                            )}
                            {s.label}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: "flex", gap: 14, padding: "12px 2px 0", fontSize: 11, color: "var(--kh-ink-500)", flexWrap: "wrap" }}>
              {[
                { dot: "#6BA07C", label: "Full — create, edit, delete" },
                { dot: "#E8866A", label: "Edit — modify only" },
                { dot: "#C9AE4E", label: "View — read only" },
                { dot: "#D97F8C", label: "Own only — scoped to their records" },
              ].map(l => (
                <span key={l.label} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: l.dot, flexShrink: 0 }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Add department modal ── */}
      {showAddDept && (
        <AddDeptModal
          locations={locations}
          onClose={() => setShowAddDept(false)}
          onSaved={handleDeptAdded}
        />
      )}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
