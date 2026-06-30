"use client"

import { useEffect, useState } from "react"
import { Loader2, Save, Building2, MapPin, User, CreditCard } from "lucide-react"

type LegalInfo = {
  id: string
  legal_entity_name: string
  country: string
  tax_id: string
  registration_number: string
  street: string
  city: string
  postal_code: string
  rep_name: string
  rep_title: string
  rep_email: string
  rep_phone: string
  updated_at: string | null
}

type Subscription = {
  id: string
  status: string
  starts_at: string
  ends_at: string
  price_at_purchase: number
  auto_renew: boolean
  subscription_plans: { id: string; Name: string; yearly_price: number } | null
} | null

const EMPTY: Omit<LegalInfo, "id" | "updated_at"> = {
  legal_entity_name: "", country: "", tax_id: "",
  registration_number: "", street: "", city: "",
  postal_code: "", rep_name: "", rep_title: "",
  rep_email: "", rep_phone: "",
}

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid var(--kh-border)", borderRadius: 8,
  padding: "9px 12px", fontSize: 13, background: "var(--kh-paper)",
  color: "var(--kh-ink-800)", outline: "none", boxSizing: "border-box",
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--kh-border)" }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--kh-peach-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-peach)", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--kh-ink-900)" }}>{title}</div>
        <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginTop: 1 }}>{subtitle}</div>
      </div>
    </div>
  )
}

function FieldRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--kh-ink-600)", textTransform: "uppercase", letterSpacing: ".05em" }}>
        {label}{required && <span style={{ color: "var(--kh-peach)", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

export default function GeneralSettingsPage() {
  const [form, setForm]           = useState(EMPTY)
  const [existingId, setExistingId] = useState<string | null>(null)
  const [sub, setSub]             = useState<Subscription>(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/tenant-legal-info").then(r => r.json()),
      fetch("/api/tenant_subscriptions").then(r => r.json()),
    ]).then(([info, subscription]) => {
      if (info && !info.error) {
        setExistingId(info.id)
        setForm({
          legal_entity_name:   info.legal_entity_name   ?? "",
          country:             info.country             ?? "",
          tax_id:              info.tax_id              ?? "",
          registration_number: info.registration_number ?? "",
          street:              info.street              ?? "",
          city:                info.city                ?? "",
          postal_code:         info.postal_code         ?? "",
          rep_name:            info.rep_name            ?? "",
          rep_title:           info.rep_title           ?? "",
          rep_email:           info.rep_email           ?? "",
          rep_phone:           info.rep_phone           ?? "",
        })
      }
      if (subscription && !subscription.error) setSub(subscription)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch("/api/tenant-legal-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? "Failed to save.")
      }
      const data = await res.json()
      setExistingId(data.id)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--kh-ink-400)" }}>
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 className="kh-h1">General</h1>
          <p className="kh-sub">Legal entity, billing address, and authorized representative.</p>
        </div>
        {!existingId && (
          <span style={{ fontSize: 11.5, background: "var(--kh-marigold-bg)", color: "#8A6200", padding: "4px 10px", borderRadius: 8, border: "1px solid #F0D080", fontWeight: 500 }}>
            Not yet configured
          </span>
        )}
      </div>

      {/* Subscription summary — read only */}
      {sub && (
        <div className="kh-card" style={{ padding: "16px 20px", marginBottom: 24 }}>
          <SectionHeader icon={<CreditCard size={16} />} title="Current plan" subtitle="Your active subscription — contact support to change" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {[
              ["Plan",       sub.subscription_plans?.Name ?? "—"],
              ["Status",     sub.status],
              ["Starts",     new Date(sub.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })],
              ["Renews",     new Date(sub.ends_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })],
              ["Price / yr", `$${Number(sub.price_at_purchase).toFixed(2)}`],
              ["Auto-renew", sub.auto_renew ? "Yes" : "No"],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: "10px 14px", borderRadius: 10, background: "var(--kh-ink-50)", border: "1px solid var(--kh-border)" }}>
                <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--kh-ink-900)", marginTop: 3 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Legal entity */}
        <div className="kh-card" style={{ padding: "20px 20px" }}>
          <SectionHeader icon={<Building2 size={16} />} title="Legal entity" subtitle="Official name and registration details" />
          <div className="kh-field-grid" style={{ gap: 14 }}>
            <FieldRow label="Legal entity name" required>
              <input name="legal_entity_name" value={form.legal_entity_name} onChange={handleChange} required style={inputStyle} placeholder="Kinderhub GmbH" />
            </FieldRow>
            <FieldRow label="Country" required>
              <input name="country" value={form.country} onChange={handleChange} required style={inputStyle} placeholder="Germany" />
            </FieldRow>
            <FieldRow label="Tax ID" required>
              <input name="tax_id" value={form.tax_id} onChange={handleChange} required style={inputStyle} placeholder="DE123456789" />
            </FieldRow>
            <FieldRow label="Registration number" required>
              <input name="registration_number" value={form.registration_number} onChange={handleChange} required style={inputStyle} placeholder="HRB 123456" />
            </FieldRow>
          </div>
        </div>

        {/* Address */}
        <div className="kh-card" style={{ padding: "20px 20px" }}>
          <SectionHeader icon={<MapPin size={16} />} title="Registered address" subtitle="Official business address for legal correspondence" />
          <div className="kh-field-grid" style={{ gap: 14 }}>
            <FieldRow label="Street" required>
              <input name="street" value={form.street} onChange={handleChange} required style={inputStyle} placeholder="Musterstraße 12" />
            </FieldRow>
            <FieldRow label="City" required>
              <input name="city" value={form.city} onChange={handleChange} required style={inputStyle} placeholder="Berlin" />
            </FieldRow>
            <FieldRow label="Postal code" required>
              <input name="postal_code" value={form.postal_code} onChange={handleChange} required style={inputStyle} placeholder="10115" />
            </FieldRow>
          </div>
        </div>

        {/* Representative */}
        <div className="kh-card" style={{ padding: "20px 20px" }}>
          <SectionHeader icon={<User size={16} />} title="Authorized representative" subtitle="Person legally authorized to act on behalf of the organization" />
          <div className="kh-field-grid" style={{ gap: 14 }}>
            <FieldRow label="Full name" required>
              <input name="rep_name" value={form.rep_name} onChange={handleChange} required style={inputStyle} placeholder="Jane Doe" />
            </FieldRow>
            <FieldRow label="Title / position" required>
              <input name="rep_title" value={form.rep_title} onChange={handleChange} required style={inputStyle} placeholder="Managing Director" />
            </FieldRow>
            <FieldRow label="Email" required>
              <input name="rep_email" type="email" value={form.rep_email} onChange={handleChange} required style={inputStyle} placeholder="jane@example.com" />
            </FieldRow>
            <FieldRow label="Phone" required>
              <input name="rep_phone" value={form.rep_phone} onChange={handleChange} required style={inputStyle} placeholder="+49 30 000 0000" />
            </FieldRow>
          </div>
        </div>

        {error && (
          <div style={{ padding: "10px 14px", background: "var(--kh-pink-bg)", borderRadius: 8, fontSize: 13, color: "var(--kh-pink-d)", border: "1px solid #F0CCCC" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "9px 22px", borderRadius: 9, fontSize: 13, fontWeight: 600,
              border: "none", cursor: saving ? "not-allowed" : "pointer",
              background: saving ? "var(--kh-ink-200)" : "var(--kh-peach)",
              color: saving ? "var(--kh-ink-400)" : "#fff",
              display: "inline-flex", alignItems: "center", gap: 7,
            }}
          >
            {saving
              ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />Saving…</>
              : <><Save size={13} />{existingId ? "Save changes" : "Save"}</>
            }
          </button>
          {saved && (
            <span style={{ fontSize: 12.5, color: "var(--kh-sage)", fontWeight: 500 }}>Saved successfully</span>
          )}
        </div>
      </form>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
