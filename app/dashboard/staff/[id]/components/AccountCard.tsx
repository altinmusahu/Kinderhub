"use client"

import type { UserById } from "./types"

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, padding: "9px 0", borderTop: "1px solid var(--kh-border-soft)", fontSize: 12.5 }}>
      <span style={{ color: "var(--kh-ink-400)" }}>{label}</span>
      <span style={{ color: "var(--kh-ink-800)", fontFamily: mono ? "var(--kh-font-mono)" : undefined, fontSize: mono ? 11.5 : undefined, wordBreak: "break-all" }}>{value}</span>
    </div>
  )
}

export function AccountCard({ user }: { user: UserById }) {
  const u = user.user
  return (
    <div className="kh-card">
      <div className="kh-card-header">
        <span className="kh-card-title">Account Details</span>
        <span style={{ fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>read-only</span>
      </div>
      <div style={{ padding: "4px 18px 14px" }}>
        <Row label="Employee ID" value={u.id.slice(0, 8).toUpperCase()}                                               mono />
        <Row label="Joined" value={u.created_at} mono />
        <Row label="First login" value={u.is_first_login_executed ? "Completed" : "Pending"} />
      </div>
    </div>
  )
}