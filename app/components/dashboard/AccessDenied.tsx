import { ShieldOff } from "lucide-react"

export function AccessDenied({ message }: { message?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 320, padding: 24 }}>
      <div className="kh-card" style={{ padding: "40px 32px", textAlign: "center", maxWidth: 380 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--kh-ink-100)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "var(--kh-ink-400)" }}>
          <ShieldOff size={22} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--kh-ink-700)", marginBottom: 6 }}>Access denied</div>
        <div style={{ fontSize: 13, color: "var(--kh-ink-400)" }}>
          {message ?? "You don't have permission to view this page."}
        </div>
      </div>
    </div>
  )
}
