"use client"

import { useEffect, useState } from "react"
import type { FamilyDetail, FamilyParent, FamilyKid } from "@/app/api/modules/families/families.types"
import type { ClassTransferEvent } from "@/app/api/modules/waitlist/waitlist.types"
import AddParentButton from "./AddParentButton"
import EditParentButton from "./EditParentButton"
import { KhTooltip } from "@/components/ui/KhTooltip"
import { DocumentsTab } from "../../staff/[id]/components/DocumentsTab"
import AddKidButton from "./AddKidButton"

const BILLING_FIELD_TOOLTIPS: Record<string, string> = {
  "Plan": "The child's attendance schedule, e.g. Full-time or Part-time on specific days — not a billing tier.",
  "Balance due": "The amount this family currently owes.",
  "Status": "Active families are currently enrolled, Waitlist families are waiting for a spot, and Paused families have temporarily stopped attending.",
}

const TABS = ["Overview", "Parents", "Billing", "Documents", "Activity"] as const
type Tab = typeof TABS[number]

function age(dob: string) {
  const diff = Date.now() - new Date(dob).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

function ChildrenCard({ kids, familyId, canEdit }: { kids: FamilyKid[]; familyId: string; canEdit: boolean }) {
  return (
    <div className="kh-card" style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span className="kh-card-title">Children</span>
        <span style={{ fontSize: 11.5, color: "var(--kh-ink-400)" }}>{kids.length} enrolled</span>
        {canEdit && <AddKidButton familyId={familyId} class_id={null} />}
      </div>
      {kids.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--kh-ink-400)", margin: 0 }}>No children added yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {kids.map((k) => (
            <div key={k.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 14px", borderRadius: 12,
              border: "1px solid var(--kh-border)", background: "var(--kh-ink-50)",
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: k.gender === "Girl" ? "#FBCFE8" : k.gender === "Boy" ? "#BFDBFE" : "#D1FAE5",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>
                {k.gender === "Girl" ? "👧" : k.gender === "Boy" ? "👦" : "🧒"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--kh-ink-900)" }}>
                  {k.firstname} {k.lastname}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--kh-ink-500)", marginTop: 2 }}>
                  {k.date_of_birth ? `${age(k.date_of_birth)} yrs · Born ${new Date(k.date_of_birth).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "—"}
                </div>
              </div>
              {k.personal_number && (
                <span style={{ fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>
                  {k.personal_number}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ParentsCard({ parents, familyId, showButton }: { parents: FamilyParent[]; familyId: string, showButton: boolean }) {
  return (
    <div className="kh-card" style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span className="kh-card-title">Parents & Guardians</span>
        {showButton ? (
          <AddParentButton familyId={familyId} />
        ) : null}
      </div>
      {parents.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--kh-ink-400)", margin: 0 }}>No parents added yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {parents.map((p, i) => (
            <div key={p.id} style={{
              padding: "13px 16px", borderRadius: 12,
              border: `1px solid ${i === 0 ? "#F0C4A8" : "var(--kh-border)"}`,
              background: "linear-gradient(180deg,#FEF0E8,var(--kh-surface) 60%)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: "var(--kh-ink-100)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "var(--kh-ink-600)",
                }}>
                  {p.firstname[0]}{p.lastname[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "var(--kh-ink-900)" }}>
                    {p.firstname} {p.lastname}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--kh-ink-500)", marginTop: 1 }}>{p.phone_number}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {p.pick_up && (
                    <span className="kh-status-badge" style={{ background: "#E8F5EC", color: "#3A8C50" }}>
                      <span className="kh-pill-dot" style={{ background: "#3A8C50" }} />
                      Pickup
                    </span>
                  )}
                  <span className="kh-status-badge" style={{
                    background: p.is_active ? "#E8F5EC" : "#F0EDE8",
                    color: p.is_active ? "#3A8C50" : "#7A7368",
                  }}>
                    <span className="kh-pill-dot" style={{ background: p.is_active ? "#3A8C50" : "#9E968A" }} />
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                  {showButton ? (
                    <EditParentButton parent={p} />
                  ) : null}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
                {[
                  ["Address", p.address || "—"],
                  ["Date of birth", p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"],
                  ["Personal No.", p.personal_number || "—"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
                    <div style={{ fontSize: 12.5, color: "var(--kh-ink-800)", marginTop: 1 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function BillingCard({ family }: { family: FamilyDetail }) {
  return (
    <div className="kh-card" style={{ padding: "18px 20px" }}>
      <div style={{ marginBottom: 14 }}>
        <span className="kh-card-title">Billing</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          ["Plan", family.plan],
          ["Balance due", `$${family.balance.toFixed(2)}`],
          ["Since", new Date(family.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })],
          ["Status", family.status],
        ].map(([label, value]) => (
          <div key={label} style={{ padding: "10px 14px", borderRadius: 10, background: "var(--kh-ink-50)", border: "1px solid var(--kh-border)" }}>
            <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", textTransform: "uppercase", letterSpacing: ".05em", display: "flex", alignItems: "center" }}>
              {label}
              {BILLING_FIELD_TOOLTIPS[label] && (
                <KhTooltip label={`What is ${label}?`}>{BILLING_FIELD_TOOLTIPS[label]}</KhTooltip>
              )}
            </div>
            <div style={{
              fontSize: 14, fontWeight: 600, marginTop: 4,
              color: label === "Balance due" && family.balance > 0 ? "#C0392B" : "var(--kh-ink-900)",
            }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OverviewTab({ family, canEdit }: { family: FamilyDetail; canEdit: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <ChildrenCard kids={family.kids} familyId={family.id} canEdit={canEdit} />
      <ParentsCard parents={family.parents} familyId={family.id} showButton={false} />
      <BillingCard family={family} />
      <div className="kh-card" style={{ padding: "18px 20px" }}>
        <div style={{ marginBottom: 14 }}>
          <span className="kh-card-title">Documents</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--kh-ink-400)", margin: 0 }}>No documents uploaded yet.</p>
      </div>
    </div>
  )
}

function ActivityTab({ familyId }: { familyId: string }) {
  const [transfers, setTransfers] = useState<ClassTransferEvent[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/families/${familyId}/waitlist-transfers`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed")
        return r.json()
      })
      .then((data: ClassTransferEvent[]) => { if (!cancelled) setTransfers(data) })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [familyId])

  return (
    <div className="kh-card" style={{ padding: "18px 20px" }}>
      <div style={{ marginBottom: 14 }}>
        <span className="kh-card-title">Activity</span>
        <p style={{ fontSize: 12, color: "var(--kh-ink-400)", margin: "4px 0 0" }}>
          Waitlist changes that happened for this family's children
        </p>
      </div>

      {error ? (
        <p style={{ fontSize: 13, color: "var(--kh-ink-400)", margin: 0 }}>Couldn&apos;t load activity.</p>
      ) : transfers === null ? (
        <p style={{ fontSize: 13, color: "var(--kh-ink-400)", margin: 0 }}>Loading…</p>
      ) : transfers.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--kh-ink-400)", margin: 0 }}>No activity yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {transfers.map((t) => (
            <div key={t.waitlist_id} style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "12px 14px", borderRadius: 12,
              border: "1px solid var(--kh-border)", background: "var(--kh-ink-50)",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: "var(--kh-peach-bg)", color: "var(--kh-peach-d)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
              }}>
                ↪
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--kh-ink-900)" }}>
                  <strong>{t.kid_name}</strong> was on the waitlist for <strong>{t.waitlisted_class_name}</strong>, but is now enrolled in <strong>{t.current_class_name}</strong>.
                </div>
                <div style={{ fontSize: 11, color: "var(--kh-ink-400)", marginTop: 4, fontFamily: "var(--kh-font-mono)" }}>
                  Waitlisted {new Date(t.waitlisted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FamilyTabs({ family, canEdit }: { family: FamilyDetail; canEdit: boolean }) {
  const [tab, setTab] = useState<Tab>("Overview")

  return (
    <>
      {/* Tab strip */}
      <div style={{
        display: "flex", gap: 2, padding: "0 28px",
        borderBottom: "1px solid var(--kh-border)",
        background: "var(--kh-surface)",
      }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "12px 16px",
              fontSize: 13, fontWeight: tab === t ? 600 : 400,
              color: tab === t ? "var(--kh-ink-900)" : "var(--kh-ink-500)",
              borderTop: "none", borderLeft: "none", borderRight: "none",
              borderBottom: tab === t ? "2px solid var(--kh-ink-900)" : "2px solid transparent",
              background: "none", borderRadius: 0,
              cursor: "pointer", transition: "color .15s",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab body */}
      <div style={{ padding: "20px 28px" }}>
        {tab === "Overview" && <OverviewTab family={family} canEdit={canEdit} />}
        {tab === "Documents" && <DocumentsTab familyId={family.id} title="Family documents" canEdit={canEdit} />}
        {tab === "Parents" && <ParentsCard parents={family.parents} familyId={family.id} showButton={canEdit} />}
        {tab === "Activity" && <ActivityTab familyId={family.id} />}
      </div>
    </>
  )
}