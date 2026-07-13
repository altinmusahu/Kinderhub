"use client"

import { useState } from "react"
import { Download, Trash2, Mail, ShieldCheck, Clock, FileText, AlertTriangle } from "lucide-react"
import { Spinner } from "@/components/ui/Spinner"

// ── CSV helpers ────────────────────────────────────────────────────────────────

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ""
  const keys = Object.keys(rows[0])
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v)
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  return [keys.join(","), ...rows.map(r => keys.map(k => escape(r[k])).join(","))].join("\n")
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionCard({
  icon, title, subtitle, children,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="kh-card" style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--kh-border)" }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--kh-peach-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kh-peach)", flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--kh-ink-900)" }}>{title}</div>
          <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginTop: 1 }}>{subtitle}</div>
        </div>
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--kh-ink-50)" }}>
      <span style={{ fontSize: 13, color: "var(--kh-ink-600)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--kh-ink-800)" }}>{value}</span>
    </div>
  )
}

function ActionButton({
  onClick, loading, loadingLabel, icon, label, variant = "default",
}: {
  onClick: () => void
  loading?: boolean
  loadingLabel?: string
  icon: React.ReactNode
  label: string
  variant?: "default" | "danger"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        border: variant === "danger" ? "1px solid #F0CCCC" : "1px solid var(--kh-border)",
        background: variant === "danger"
          ? (loading ? "var(--kh-ink-50)" : "#FEF2F2")
          : (loading ? "var(--kh-ink-50)" : "var(--kh-bg)"),
        color: variant === "danger"
          ? (loading ? "var(--kh-ink-400)" : "#C0392B")
          : (loading ? "var(--kh-ink-400)" : "var(--kh-ink-700)"),
      }}
    >
      {loading
        ? <Spinner size="sm" />
        : icon}
      {loading ? (loadingLabel ?? label) : label}
    </button>
  )
}

// ── Export section ─────────────────────────────────────────────────────────────

type ExportKey = "families" | "staff" | "children" | "classes"

const EXPORTS: { key: ExportKey; label: string; endpoint: string; filename: string; desc: string }[] = [
  { key: "families",  label: "Families",      endpoint: "/api/families",  filename: "families.csv",  desc: "Family names, status, plan, balance" },
  { key: "staff",     label: "Staff",         endpoint: "/api/users",     filename: "staff.csv",     desc: "Names, roles, departments, contact info" },
  { key: "children",  label: "Children",      endpoint: "/api/kids",      filename: "children.csv",  desc: "Child records — name, DOB, class, gender" },
  { key: "classes",   label: "Classes",       endpoint: "/api/classes",   filename: "classes.csv",   desc: "Class names, capacity, schedule, location" },
]

function ExportSection() {
  const [loading, setLoading] = useState<ExportKey | null>(null)
  const [error, setError]     = useState<string | null>(null)

  async function handleExport(key: ExportKey, endpoint: string, filename: string) {
    setLoading(key)
    setError(null)
    try {
      const res = await fetch(endpoint)
      if (!res.ok) throw new Error(`Failed to fetch ${filename}`)
      const data = await res.json()
      const rows = Array.isArray(data) ? data : [data]
      if (!rows.length) throw new Error("No data to export.")
      downloadCSV(filename, toCSV(rows))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.")
    } finally {
      setLoading(null)
    }
  }

  async function handleExportAll() {
    setLoading("families") // use any key to show loading state on "Export all"
    setError(null)
    try {
      const results = await Promise.all(
        EXPORTS.map(e => fetch(e.endpoint).then(r => r.json()).then(d => ({ ...e, data: Array.isArray(d) ? d : [d] })))
      )
      for (const { data, filename } of results) {
        if (data.length) downloadCSV(filename, toCSV(data))
      }
    } catch {
      setError("One or more exports failed. Try individual exports below.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <SectionCard icon={<Download size={16} />} title="Export your data" subtitle="Download your organisation's data as CSV files at any time">
      <div style={{ marginBottom: 14 }}>
        <button
          type="button"
          onClick={handleExportAll}
          disabled={loading !== null}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            border: "none", cursor: loading !== null ? "not-allowed" : "pointer",
            background: loading !== null ? "var(--kh-ink-200)" : "var(--kh-peach)",
            color: loading !== null ? "var(--kh-ink-400)" : "#fff",
          }}
        >
          {loading !== null
            ? <><Spinner size="sm" />Exporting…</>
            : <><Download size={13} />Export all data</>}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {EXPORTS.map(({ key, label, endpoint, filename, desc }) => (
          <div key={key} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            padding: "11px 14px", borderRadius: 10,
            border: "1px solid var(--kh-border)", background: "var(--kh-ink-50)",
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--kh-ink-800)" }}>{label}</div>
              <div style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginTop: 1 }}>{desc}</div>
            </div>
            <ActionButton
              onClick={() => handleExport(key, endpoint, filename)}
              loading={loading === key}
              loadingLabel="Exporting…"
              icon={<Download size={13} />}
              label={`Export ${label}`}
            />
          </div>
        ))}
      </div>

      {error && (
        <div style={{ marginTop: 10, padding: "8px 12px", background: "var(--kh-pink-bg)", borderRadius: 8, fontSize: 12.5, color: "var(--kh-pink-d)" }}>
          {error}
        </div>
      )}
    </SectionCard>
  )
}

// ── Right to erasure ───────────────────────────────────────────────────────────

function ErasureSection() {
  const [sent, setSent] = useState(false)

  function handleRequest() {
    const subject = encodeURIComponent("Right to Erasure Request — Kinderhub")
    const body    = encodeURIComponent(
      "Hello Kinderhub team,\n\nI am submitting a formal Right to Erasure request under GDPR Article 17.\n\nPlease permanently delete all personal data associated with my organisation's account.\n\nI understand this action is irreversible and that I should export any data I need before deletion is processed.\n\nThank you."
    )
    window.open(`mailto:privacy@kinderhub.io?subject=${subject}&body=${body}`)
    setSent(true)
  }

  return (
    <SectionCard icon={<Trash2 size={16} />} title="Right to erasure" subtitle="Request permanent deletion of your organisation's data under GDPR Article 17">
      <p style={{ fontSize: 13, color: "var(--kh-ink-600)", lineHeight: 1.65, marginBottom: 14 }}>
        You may request that all personal data associated with your account be permanently and irreversibly deleted from our systems. Once processed, this cannot be undone. We recommend exporting your data first.
      </p>
      <div style={{ padding: "10px 14px", borderRadius: 10, background: "#FDF6E3", border: "1px solid #F0D080", display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 16, fontSize: 12.5, color: "#8A6200" }}>
        <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
        This will schedule deletion of all families, children, staff, documents, and activity logs. Your subscription will be cancelled and cannot be recovered.
      </div>
      {sent ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--kh-sage)", fontWeight: 500 }}>
          <Mail size={14} />
          Erasure request sent — our team will respond within 30 days.
        </div>
      ) : (
        <ActionButton
          onClick={handleRequest}
          icon={<Mail size={13} />}
          label="Submit erasure request via email"
          variant="danger"
        />
      )}
    </SectionCard>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function DataPrivacySettingsPage() {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 className="kh-h1">Data &amp; privacy</h1>
        <p className="kh-sub">Retention policies, data exports, and GDPR compliance settings.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Compliance status ── */}
        <SectionCard icon={<ShieldCheck size={16} />} title="Compliance status" subtitle="How Kinderhub protects your data and meets regulatory requirements">
          <InfoRow label="GDPR compliance"         value="✓ Compliant" />
          <InfoRow label="Data processing location" value="EU (Frankfurt, eu-west-1)" />
          <InfoRow label="Encryption at rest"       value="AES-256" />
          <InfoRow label="Encryption in transit"    value="TLS 1.3" />
          <InfoRow label="Data Processing Agreement" value="Included with all plans" />
          <InfoRow label="COPPA"                    value="Children's data is never used for advertising" />
          <div style={{ marginTop: 14 }}>
            <a
              href="mailto:privacy@kinderhub.io"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--kh-peach)", textDecoration: "none", fontWeight: 500 }}
            >
              <Mail size={13} />
              Contact our Data Protection Officer — privacy@kinderhub.io
            </a>
          </div>
        </SectionCard>

        {/* ── Retention policy ── */}
        <SectionCard icon={<Clock size={16} />} title="Data retention policy" subtitle="How long we keep your data and what happens after cancellation">
          <InfoRow label="Active account data"      value="Retained indefinitely while subscription is active" />
          <InfoRow label="After cancellation"        value="Data retained for 30 days, then permanently deleted" />
          <InfoRow label="Activity logs"             value="Retained for 12 months, then purged" />
          <InfoRow label="Uploaded documents"        value="Deleted within 30 days of account cancellation" />
          <InfoRow label="Backups"                   value="Daily backups, retained for 7 days" />
          <InfoRow label="Early deletion"            value="Available on request — see Right to Erasure below" />
          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "var(--kh-ink-50)", border: "1px solid var(--kh-border)", fontSize: 12.5, color: "var(--kh-ink-500)" }}>
            We recommend exporting a copy of your data before cancelling your subscription.
          </div>
        </SectionCard>

        {/* ── Legal documents ── */}
        <SectionCard icon={<FileText size={16} />} title="Legal documents" subtitle="Our policies and agreements governing how we handle your data">
          {([
            ["Privacy Policy",          "https://kinderhub.io/privacy",   "Last updated June 2025"],
            ["Terms of Service",        "https://kinderhub.io/terms",     "Last updated June 2025"],
            ["Data Processing Agreement","https://kinderhub.io/dpa",      "GDPR Article 28 compliant"],
            ["Cookie Policy",           "https://kinderhub.io/cookies",   "Essential cookies only"],
          ] as [string, string, string][]).map(([label, , note]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--kh-ink-50)" }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--kh-ink-800)" }}>{label}</span>
                <span style={{ fontSize: 11.5, color: "var(--kh-ink-400)", marginLeft: 10 }}>{note}</span>
              </div>
              <span style={{ fontSize: 12, color: "var(--kh-ink-400)", fontStyle: "italic" }}>Available on request</span>
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <a
              href="mailto:legal@kinderhub.io"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--kh-peach)", textDecoration: "none", fontWeight: 500 }}
            >
              <Mail size={13} />
              Request a document — legal@kinderhub.io
            </a>
          </div>
        </SectionCard>

        {/* ── Export ── */}
        <ExportSection />

        {/* ── Right to erasure ── */}
        <ErasureSection />

      </div>
    </>
  )
}
