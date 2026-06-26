import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyToken, cookieName } from "@/lib/auth"

const TONE_DOT: Record<string, string> = {
  clay:   "#D2592F",
  peach:  "#E8866A",
  sage:   "#6BA07C",
  pink:   "#D97F8C",
  butter: "#C9AE4E",
}

const CELL_STYLE: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  full: { bg: "#EAF3EC", color: "#2E5E3A", dot: "#6BA07C", label: "Full"     },
  edit: { bg: "#FEF0E8", color: "#7A3318", dot: "#E8866A", label: "Edit"     },
  view: { bg: "#FEF7E0", color: "#6B5A10", dot: "#C9AE4E", label: "View"     },
  own:  { bg: "#FCEEF0", color: "#7A303A", dot: "#D97F8C", label: "Own only" },
  none: { bg: "#F5F3EF", color: "#9E968A", dot: "transparent", label: "—"   },
}

export default async function TeamPage() {
  const store = await cookies()
  const token = store.get(cookieName())?.value ?? null
  if (!token) redirect("/login")
  const session = await verifyToken(token)
  if (!session) redirect("/login")

  const departments = [
    { id: "admin", name: "Administration",         lead: "Nina Kowalski",  count: 3, tone: "clay",   desc: "Director & operations",          active: true },
    { id: "care",  name: "Classroom & Care",       lead: "Priya Raghavan", count: 9, tone: "peach",  desc: "Leads, assistants, floaters" },
    { id: "edu",   name: "Education & Curriculum", lead: "Marcus Alemán",  count: 4, tone: "sage",   desc: "Program design & training" },
    { id: "fam",   name: "Family Relations",       lead: "Nina Kowalski",  count: 2, tone: "pink",   desc: "Enrollment, tours, parent comms" },
    { id: "fin",   name: "Finance & Billing",      lead: "Eliot (ext.)",   count: 1, tone: "butter", desc: "Invoicing & payroll" },
    { id: "kit",   name: "Kitchen & Facilities",   lead: "Jun Park",       count: 3, tone: "clay",   desc: "Meals, supplies, cleaning" },
  ]

  const members = [
    { name: "Nina Kowalski",  role: "Director",        status: "Full access", since: "2019", last: "now"    },
    { name: "Priya Raghavan", role: "Operations lead", status: "Full access", since: "2021", last: "2m ago" },
    { name: "Rowan Baird",    role: "Admin assistant", status: "Restricted",  since: "2024", last: "11m ago" },
  ]

  const roles = [
    { name: "Owner",         count: 1,  scope: "Everything · billing · export",                  tone: "clay"   },
    { name: "Director",      count: 2,  scope: "All departments · billing · messaging",           tone: "peach"  },
    { name: "Lead teacher",  count: 4,  scope: "Own room · own families · attendance",            tone: "sage"   },
    { name: "Assistant",     count: 6,  scope: "Own room · attendance only",                      tone: "butter" },
    { name: "Finance",       count: 1,  scope: "Billing · reports · no profiles",                 tone: "pink"   },
    { name: "Parent portal", count: 98, scope: "Own child · messages · invoices", external: true, tone: "clay"   },
  ]

  const resources = ["Families", "Children profiles", "Staff", "Classes", "Billing", "Messages", "Documents", "Calendar", "Settings"]
  const matrix: Record<string, string[]> = {
    "Owner":          ["full","full","full","full","full","full","full","full","full"],
    "Director":       ["full","full","full","full","full","full","full","full","edit"],
    "Lead teacher":   ["view","edit","view","edit","none","edit","view","edit","none"],
    "Assistant":      ["view","view","none","view","none","view","view","view","none"],
    "Finance":        ["view","none","view","view","full","none","view","view","none"],
    "Parent portal":  ["own", "own", "none","own", "own", "own", "own", "own", "none"],
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h1 className="kh-h1">Team &amp; access</h1>
          <p className="kh-sub" style={{ margin: 0 }}>Organize staff by department. Roles decide what each person sees.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="kh-status-badge" style={{ background: "#EAF3EC", color: "#2E5E3A" }}>
            <span className="kh-pill-dot" style={{ background: "#6BA07C" }} /> 18 active members
          </span>
          <span className="kh-status-badge" style={{ background: "#FEF7E0", color: "#6B5A10" }}>
            2 invites pending
          </span>
          <button className="kh-btn">📄 Audit log</button>
          <button className="kh-btn kh-btn--primary">+ Invite member</button>
        </div>
      </div>

      {/* Departments */}
      <div style={{ fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
        Departments · {departments.length}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        {departments.map(d => (
          <div key={d.id} className="kh-card" style={{
            padding: "14px 16px",
            borderColor: d.active ? TONE_DOT[d.tone] + "66" : "var(--kh-border)",
            background: d.active ? `linear-gradient(180deg, ${TONE_DOT[d.tone]}18, var(--kh-surface) 70%)` : "var(--kh-surface)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: TONE_DOT[d.tone], flexShrink: 0 }} />
              <div style={{ fontWeight: 600, color: "var(--kh-ink-900)", fontSize: 13.5, flex: 1 }}>{d.name}</div>
              <span style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11, color: "var(--kh-ink-500)" }}>{d.count}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--kh-ink-500)", marginBottom: 10 }}>{d.desc}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5 }}>
              <span style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                background: TONE_DOT[d.tone] + "33", color: TONE_DOT[d.tone],
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700,
              }}>
                {d.lead.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </span>
              <span style={{ color: "var(--kh-ink-600)" }}>{d.lead}</span>
              <span style={{ color: "var(--kh-ink-400)" }}>· lead</span>
            </div>
          </div>
        ))}
        <div className="kh-card" style={{
          padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, color: "var(--kh-ink-500)", border: "1px dashed var(--kh-ink-300)",
          background: "transparent", cursor: "pointer", fontSize: 13,
        }}>
          + Add department
        </div>
      </div>

      {/* Members table */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".08em" }}>
          Members in Administration
        </div>
        <div style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>3 people</div>
      </div>
      <div className="kh-card" style={{ overflow: "hidden", marginBottom: 28 }}>
        <table className="kh-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Access level</th>
              <th>Joined</th>
              <th>Last active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.name}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="kh-avatar" style={{ background: "#E8866A33", color: "#E8866A", width: 32, height: 32, borderRadius: "50%", fontSize: 11, fontWeight: 700 }}>
                      {m.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--kh-ink-900)", fontSize: 13 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>
                        {m.name.split(" ")[0].toLowerCase()}@kinderhub.co
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ color: "var(--kh-ink-600)", fontSize: 13 }}>{m.role}</td>
                <td>
                  <span className="kh-status-badge" style={{
                    background: m.status === "Full access" ? "#EAF3EC" : "#FEF7E0",
                    color: m.status === "Full access" ? "#2E5E3A" : "#6B5A10",
                  }}>
                    <span className="kh-pill-dot" style={{ background: m.status === "Full access" ? "#6BA07C" : "#C9AE4E" }} />
                    {m.status}
                  </span>
                </td>
                <td style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11.5, color: "var(--kh-ink-400)" }}>{m.since}</td>
                <td style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11.5, color: "var(--kh-ink-500)" }}>{m.last}</td>
                <td style={{ width: 32, textAlign: "center", color: "var(--kh-ink-400)", fontSize: 16, cursor: "pointer" }}>···</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Roles + Permission matrix */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
        <div className="kh-card">
          <div className="kh-card-header">
            <span className="kh-card-title">Roles</span>
            <span className="kh-card-meta">{roles.length}</span>
          </div>
          <div style={{ padding: "2px 8px 14px" }}>
            {roles.map(r => (
              <div key={r.name} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "11px 10px", borderTop: "1px solid var(--kh-border-soft)",
              }}>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: TONE_DOT[r.tone], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontWeight: 600, color: "var(--kh-ink-900)", fontSize: 12.5 }}>{r.name}</div>
                    {r.external && (
                      <span className="kh-status-badge" style={{ background: "var(--kh-ink-50)", color: "var(--kh-ink-500)", fontSize: 10 }}>
                        external
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--kh-ink-500)", marginTop: 2 }}>{r.scope}</div>
                </div>
                <span style={{ fontFamily: "var(--kh-font-mono)", fontSize: 11, color: "var(--kh-ink-500)" }}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="kh-card" style={{ overflow: "hidden" }}>
          <div className="kh-card-header">
            <span className="kh-card-title">What each role sees</span>
            <span className="kh-card-meta">permission matrix</span>
          </div>
          <div style={{ padding: "4px 14px 14px", overflowX: "auto" }}>
            <table className="kh-table" style={{ minWidth: "100%" }}>
              <thead>
                <tr>
                  <th>Resource</th>
                  {Object.keys(matrix).map(k => (
                    <th key={k} style={{ textAlign: "center", whiteSpace: "nowrap" }}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resources.map((res, ri) => (
                  <tr key={res}>
                    <td style={{ fontWeight: 500, color: "var(--kh-ink-800)", whiteSpace: "nowrap" }}>{res}</td>
                    {Object.keys(matrix).map(role => {
                      const v = matrix[role][ri]
                      const s = CELL_STYLE[v] ?? CELL_STYLE.none
                      return (
                        <td key={role} style={{ textAlign: "center" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "2px 8px", borderRadius: 6,
                            background: s.bg, color: s.color,
                            fontSize: 11, fontWeight: 500, whiteSpace: "nowrap",
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
                { dot: "#D97F8C", label: "Own only — scoped to their family / room" },
              ].map(l => (
                <span key={l.label} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: l.dot, flexShrink: 0 }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
