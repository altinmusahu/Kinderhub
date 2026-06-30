"use client"

import { useEffect, useState } from "react"
import { Loader2, CreditCard, Calendar, RefreshCw, DollarSign, CheckCircle2, Clock, ArrowUpRight, Sparkles } from "lucide-react"
import { PLANS, getPlanByCode, getPlanByName, type PlanInfo } from "@/lib/plans"

type DbPlan = {
  id: string
  code: string
  Name: string
  yearly_price: number
  is_active: boolean
}

type Subscription = {
  id: string
  status: string
  starts_at: string
  ends_at: string
  price_at_purchase: number
  auto_renew: boolean
  created_at: string
  subscription_plans: { id: string; Name: string; yearly_price: number } | null
}

function fmtLong(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function daysUntil(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000))
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "active"
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: active ? "#E8F5EC" : "#F0EDE8",
      color: active ? "#3A8C50" : "#7A7368",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "#3A8C50" : "#9E968A", display: "inline-block" }} />
      {active ? "Active" : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function PlanCard({ dbPlan, isUpgrade, isDowngrade }: { dbPlan: DbPlan; isUpgrade: boolean; isDowngrade: boolean }) {
  const info    = getPlanByCode(dbPlan.code) ?? getPlanByName(dbPlan.Name)
  const name    = info?.name    ?? dbPlan.Name
  const subject = encodeURIComponent(`${isUpgrade ? "Upgrade" : "Switch"} to ${name}`)
  const body    = encodeURIComponent(
    `Hello Kinderhub team,\n\nI would like to ${isUpgrade ? "upgrade" : "switch"} my subscription to the ${name} plan ($${dbPlan.yearly_price}/year).\n\nPlease assist me with this change.\n\nThank you.`
  )

  return (
    <div className="kh-card" style={{
      padding: "20px 18px",
      border: isUpgrade ? "1px solid #F0C4A8" : "1px solid var(--kh-border)",
      background: isUpgrade ? "linear-gradient(135deg,#FEF0E8 0%,var(--kh-surface) 70%)" : "var(--kh-surface)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--kh-ink-900)" }}>{name}</div>
        {isUpgrade && (
          <span style={{ fontSize: 10.5, fontWeight: 600, background: "var(--kh-peach-bg)", color: "var(--kh-peach)", padding: "2px 8px", borderRadius: 20, border: "1px solid #F0C4A8" }}>
            Upgrade
          </span>
        )}
        {isDowngrade && (
          <span style={{ fontSize: 10.5, fontWeight: 600, background: "var(--kh-ink-50)", color: "var(--kh-ink-500)", padding: "2px 8px", borderRadius: 20, border: "1px solid var(--kh-border)" }}>
            Downgrade
          </span>
        )}
      </div>

      {info?.description && (
        <div style={{ fontSize: 12, color: "var(--kh-ink-400)", marginBottom: 10 }}>{info.description}</div>
      )}

      <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 24, color: "var(--kh-ink-900)", marginBottom: 12 }}>
        ${Number(dbPlan.yearly_price).toFixed(0)}
        <span style={{ fontSize: 12, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-sans)", marginLeft: 4 }}>/year</span>
      </div>

      {info?.features && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
          {info.features.map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--kh-ink-600)" }}>
              <CheckCircle2 size={12} style={{ color: "var(--kh-sage)", flexShrink: 0 }} />
              {f}
            </div>
          ))}
        </div>
      )}

      <a
        href={`mailto:support@kinderhub.io?subject=${subject}&body=${body}`}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "9px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600,
          textDecoration: "none", boxSizing: "border-box", width: "100%",
          background: isUpgrade ? "var(--kh-peach)" : "var(--kh-bg)",
          color: isUpgrade ? "#fff" : "var(--kh-ink-700)",
          border: isUpgrade ? "none" : "1px solid var(--kh-ink-200)",
        }}
      >
        <ArrowUpRight size={13} />
        Contact us to {isUpgrade ? "upgrade" : "switch"}
      </a>
    </div>
  )
}

export default function BillingPlanPage() {
  const [sub, setSub]         = useState<Subscription | null>(null)
  const [dbPlans, setDbPlans] = useState<DbPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/tenant_subscriptions").then(r => r.json()),
      fetch("/api/subscription_plans").then(r => r.json()),
    ]).then(([subData, plansData]) => {
      if (subData && !subData.error) setSub(subData)
      if (Array.isArray(plansData)) setDbPlans(plansData)
    }).catch(() => setError("Failed to load billing information."))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 260, color: "var(--kh-ink-400)", gap: 10 }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 13 }}>Loading billing…</span>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <>
        <h1 className="kh-h1">Billing plan</h1>
        <div className="kh-card" style={{ marginTop: 24, padding: 20, color: "var(--kh-pink-d)", fontSize: 13 }}>{error}</div>
      </>
    )
  }

  // Resolve the current plan info from shared constants
  const currentDbPlanName = sub?.subscription_plans?.Name ?? null
  const currentPlanInfo: PlanInfo | undefined = currentDbPlanName
    ? (getPlanByName(currentDbPlanName) ?? getPlanByCode(currentDbPlanName.toLowerCase()))
    : undefined

  const days           = sub ? daysUntil(sub.ends_at) : 0
  const pct            = sub
    ? Math.min(100, Math.max(0, ((Date.now() - new Date(sub.starts_at).getTime()) / (new Date(sub.ends_at).getTime() - new Date(sub.starts_at).getTime())) * 100))
    : 0
  const barColor       = pct > 80 ? "#C0392B" : pct > 55 ? "#F3B43C" : "#7FA06A"
  const isExpiringSoon = days <= 30 && sub?.status === "active"
  const currentPlanId  = sub?.subscription_plans?.id ?? null
  const otherDbPlans   = dbPlans.filter(p => p.id !== currentPlanId)

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 className="kh-h1">Billing plan</h1>
        <p className="kh-sub">Your current Kinderhub subscription. To make changes, contact our team.</p>
      </div>

      {!sub ? (
        <div className="kh-card" style={{ padding: "48px 24px", textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--kh-ink-100)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "var(--kh-ink-400)" }}>
            <CreditCard size={22} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--kh-ink-700)", marginBottom: 6 }}>No active subscription found</div>
          <div style={{ fontSize: 13, color: "var(--kh-ink-400)" }}>Contact support to get started.</div>
        </div>
      ) : (
        <>
          {/* ── Current plan hero ── */}
          <div className="kh-card" style={{
            padding: "22px 24px", marginBottom: 14,
            background: "linear-gradient(135deg,#FEF0E8 0%,var(--kh-surface) 60%)",
            border: "1px solid #F0C4A8",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--kh-peach-bg)", border: "1px solid #F0C4A8", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-peach)", flexShrink: 0 }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "var(--kh-font-mono)", marginBottom: 3 }}>
                    Current plan
                  </div>
                  <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 26, color: "var(--kh-ink-900)", lineHeight: 1.1 }}>
                    {currentPlanInfo?.name ?? sub.subscription_plans?.Name ?? "—"}
                  </div>
                  {currentPlanInfo?.description && (
                    <div style={{ fontSize: 12.5, color: "var(--kh-ink-500)", marginTop: 3 }}>
                      {currentPlanInfo.description}
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: "var(--kh-ink-500)", marginTop: 2 }}>
                    ${Number(sub.price_at_purchase).toFixed(2)} / year
                  </div>
                </div>
              </div>
              <StatusBadge status={sub.status} />
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ height: 6, borderRadius: 99, background: "var(--kh-ink-100)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: barColor, transition: "width .4s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--kh-ink-400)", marginTop: 6 }}>
                <span>{fmtShort(sub.starts_at)}</span>
                <span style={{ color: days <= 30 ? "#C0392B" : "var(--kh-ink-400)", fontWeight: days <= 30 ? 600 : 400 }}>
                  {days > 0 ? `${days} day${days !== 1 ? "s" : ""} remaining` : "Expired"}
                </span>
                <span>{fmtShort(sub.ends_at)}</span>
              </div>
            </div>

            {isExpiringSoon && (
              <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "#FDF6E3", border: "1px solid #F0D080", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#8A6200" }}>
                <Clock size={14} style={{ flexShrink: 0 }} />
                Renewing in <strong style={{ margin: "0 3px" }}>{days} day{days !== 1 ? "s" : ""}</strong> — auto-renew is {sub.auto_renew ? <strong style={{ color: "#3A8C50", marginLeft: 3 }}>on</strong> : <strong style={{ color: "#C0392B", marginLeft: 3 }}>off</strong>}
              </div>
            )}
          </div>

          {/* ── Stat cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10, marginBottom: 14 }}>
            {([
              { icon: <DollarSign size={15} />, label: "Price / year",  value: `$${Number(sub.price_at_purchase).toFixed(2)}` },
              { icon: <Calendar size={15} />,   label: "Started",       value: fmtLong(sub.starts_at) },
              { icon: <Calendar size={15} />,   label: sub.auto_renew ? "Renews" : "Expires", value: fmtLong(sub.ends_at) },
              { icon: <RefreshCw size={15} />,  label: "Auto-renew",    value: sub.auto_renew ? "Enabled" : "Disabled" },
            ] as { icon: React.ReactNode; label: string; value: string }[]).map(({ icon, label, value }) => (
              <div key={label} className="kh-card" style={{ padding: "13px 15px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--kh-ink-50)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-ink-400)", flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--kh-ink-900)" }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Included features ── */}
          {currentPlanInfo && (
            <div className="kh-card" style={{ padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--kh-ink-800)", marginBottom: 12 }}>
                What&apos;s included in {currentPlanInfo.name}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "7px 24px" }}>
                {currentPlanInfo.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--kh-ink-700)" }}>
                    <CheckCircle2 size={13} style={{ color: "var(--kh-sage)", flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Other available plans ── */}
      {otherDbPlans.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Sparkles size={14} style={{ color: "var(--kh-peach)" }} />
            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--kh-ink-800)" }}>
              {sub ? "Other plans" : "Available plans"}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
            {otherDbPlans.map(p => {
              const isUpgrade   = sub ? p.yearly_price > sub.price_at_purchase : true
              const isDowngrade = sub ? p.yearly_price < sub.price_at_purchase : false
              return (
                <PlanCard key={p.id} dbPlan={p} isUpgrade={isUpgrade} isDowngrade={isDowngrade} />
              )
            })}
          </div>
        </div>
      )}

      {/* ── All plans reference (when no sub) ── */}
      {!sub && otherDbPlans.length === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12, marginBottom: 20 }}>
          {PLANS.map(p => (
            <div key={p.code} className="kh-card" style={{ padding: "20px 18px" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--kh-ink-900)", marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "var(--kh-ink-400)", marginBottom: 10 }}>{p.description}</div>
              <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 24, color: "var(--kh-ink-900)", marginBottom: 12 }}>
                ${p.price}<span style={{ fontSize: 12, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-sans)", marginLeft: 4 }}>/year</span>
              </div>
              {p.features.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--kh-ink-600)", marginBottom: 5 }}>
                  <CheckCircle2 size={12} style={{ color: "var(--kh-sage)", flexShrink: 0 }} />{f}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Info notice ── */}
      <div style={{
        padding: "12px 16px", borderRadius: 10,
        background: "var(--kh-ink-50)", border: "1px solid var(--kh-border)",
        fontSize: 12.5, color: "var(--kh-ink-500)",
        display: "flex", alignItems: "flex-start", gap: 8,
      }}>
        <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>ℹ</span>
        <span>
          Plan changes take effect at the start of your next billing period. Email{" "}
          <a href="mailto:support@kinderhub.io" style={{ color: "var(--kh-peach)", textDecoration: "none", fontWeight: 500 }}>
            support@kinderhub.io
          </a>{" "}
          or click any plan above to get started.
        </span>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
