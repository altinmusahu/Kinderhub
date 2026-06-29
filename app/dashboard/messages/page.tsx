"use client"
import React, { useState } from "react"
import MobileMenuButton from "@/app/components/dashboard/MobileMenuButton"

const threads = [
  { id: "DC", name: "Diana Castellanos", family: "Castellanos",   color: "#D97F8C", time: "14m", preview: "Mateo will skip Thursday — we're visiting f...", unread: true  },
  { id: "AO", name: "Amara Okafor",      family: "Okafor-Lind",  color: "#E8866A", time: "1h",  preview: "Can we add Jonas to the pickup list for Tu...", unread: true  },
  { id: "RY", name: "Rin Yamazaki",      family: "Yamazaki",     color: "#C9AE4E", time: "3h",  preview: "Thanks for scheduling the tour! Is stroller park...", unread: false },
  { id: "FO", name: "Femi Oduya",        family: "Oduya",        color: "#7CA0B4", time: "yesterday", preview: "Ade lost her blue water bottle yesterday — an...", unread: false },
  { id: "SB", name: "Spring picnic · Broadcast", family: "All families", color: "#6BA07C", time: "2d", preview: "Reminder: Spring picnic on Saturday, 10am–1...", unread: false },
  { id: "IV", name: "Irina Volkov",      family: "Volkov",       color: "#A07CB4", time: "2d",  preview: "Invoice question — did the sibling credit appl...", unread: false },
  { id: "LA", name: "Laila Ahmed",       family: "Benitez-Ahmed",color: "#6BA07C", time: "3d",  preview: "Omar's bag had extra socks today — he's goo...", unread: false },
  { id: "HP", name: "Hannah Park",       family: "Park",         color: "#C9AE4E", time: "3d",  preview: "Ellis picked up a little cough — keeping him h...", unread: false },
]

const messages = [
  { from: "DC", text: "Hi Nina — Mateo won't be in Thursday. We're visiting family out of town, back Friday as usual.", time: "9:14 AM", self: false },
  { from: "DC", text: "Also wanted to double-check: does that change the invoice, or should I expect the usual MWF rate?", time: "9:14 AM", self: false },
  { from: "me", text: "Hi Diana! Noted — I'll mark Mateo absent for Thursday. Part-time MWF is a fixed plan so the invoice stays the same. Hope you have a lovely trip 🌿", time: "9:21 AM", self: true },
  { from: "DC", text: "Perfect, thank you! See you Friday.", time: "9:22 AM", self: false },
]

export default function MessagesPage() {
  const [active, setActive] = useState(0)
  const thread = threads[active]

  return (
    <div className="kh-page" style={{ overflow: "hidden" }}>
      <header className="kh-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MobileMenuButton />
          <nav className="kh-breadcrumb">
            <span className="kh-breadcrumb-parent">Kinderhub</span>
            <span className="kh-breadcrumb-sep">/</span>
            <span className="kh-breadcrumb-current">Messages</span>
          </nav>
        </div>
        <div className="kh-topbar-right">
          <button className="kh-btn">≡ Unread</button>
          <button className="kh-btn">🌐 Broadcast</button>
          <button className="kh-btn kh-btn--primary">+ New message</button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 240px", flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Thread list */}
        <div style={{ borderRight: "1px solid var(--kh-border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid var(--kh-border-soft)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--kh-ink-900)", marginBottom: 8 }}>Inbox</div>
            <div style={{ fontSize: 12, color: "var(--kh-ink-400)" }}>3 unread · 8 threads</div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, background: "var(--kh-ink-50)", border: "1px solid var(--kh-border)", borderRadius: 6, padding: "6px 10px" }}>
              <span style={{ fontSize: 11, color: "var(--kh-ink-400)" }}>🔍</span>
              <span style={{ fontSize: 12, color: "var(--kh-ink-400)" }}>Search conversations</span>
            </div>
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            {threads.map((t, i) => (
              <div
                key={t.id + i}
                onClick={() => setActive(i)}
                style={{
                  padding: "12px 14px",
                  cursor: "pointer",
                  background: i === active ? "var(--kh-ink-50)" : "transparent",
                  borderLeft: i === active ? "3px solid var(--kh-peach)" : "3px solid transparent",
                  borderBottom: "1px solid var(--kh-border-soft)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                  <span className="kh-avatar" style={{ background: t.color + "22", color: t.color, width: 26, height: 26, fontSize: 9, flexShrink: 0 }}>{t.id.slice(0,2)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: t.unread ? 700 : 500, color: "var(--kh-ink-900)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                      <span style={{ fontSize: 11, color: "var(--kh-ink-400)", flexShrink: 0, marginLeft: 4 }}>{t.time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--kh-ink-400)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.family}</div>
                  </div>
                  {t.unread && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--kh-peach)", flexShrink: 0 }} />}
                </div>
                <div style={{ fontSize: 12, color: "var(--kh-ink-400)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingLeft: 35 }}>{t.preview}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--kh-border)", display: "flex", alignItems: "center", gap: 12 }}>
            <span className="kh-avatar" style={{ background: thread.color + "22", color: thread.color }}>{thread.id.slice(0,2)}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--kh-ink-900)" }}>{thread.name}</div>
              <div style={{ fontSize: 12, color: "var(--kh-ink-400)" }}>Mother of Mateo · Meadow</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button className="kh-btn" style={{ padding: "5px 10px" }}>📞</button>
              <button className="kh-btn" style={{ padding: "5px 10px" }}>⋯</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ textAlign: "center", fontSize: 11, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", marginBottom: 4 }}>TODAY</div>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.self ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "68%" }}>
                  <div style={{
                    background: m.self ? "var(--kh-peach)" : "var(--kh-surface)",
                    color: m.self ? "#fff" : "var(--kh-ink-800)",
                    border: m.self ? "none" : "1px solid var(--kh-border)",
                    borderRadius: m.self ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    padding: "10px 14px",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}>{m.text}</div>
                  <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", marginTop: 3, textAlign: m.self ? "right" : "left", fontFamily: "var(--kh-font-mono)" }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--kh-border)", display: "flex", alignItems: "center", gap: 10 }}>
            <button className="kh-btn" style={{ padding: "6px 10px", fontSize: 14 }}>📎</button>
            <div style={{ flex: 1, background: "var(--kh-ink-50)", border: "1px solid var(--kh-border)", borderRadius: 8, padding: "9px 14px", fontSize: 13, color: "var(--kh-ink-400)" }}>
              Reply to Diana...
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "var(--kh-ink-900)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Send <kbd style={{ fontFamily: "var(--kh-font-mono)", fontSize: 10, opacity: .7 }}>⌘↵</kbd>
            </button>
          </div>
        </div>

        {/* Family context */}
        <div style={{ borderLeft: "1px solid var(--kh-border)", padding: "16px", overflow: "auto" }}>
          <div style={{ fontSize: 10, fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".07em", color: "var(--kh-ink-400)", marginBottom: 10 }}>Family context</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--kh-ink-900)", marginBottom: 8 }}>Castellanos</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            <span className="kh-status-badge" style={{ background: "#E8F5EC", color: "#3A8C50" }}><span className="kh-pill-dot" style={{ background: "#3A8C50" }} />Active</span>
            <span className="kh-status-badge" style={{ background: "#FDEAEA", color: "#C0392B" }}><span className="kh-pill-dot" style={{ background: "#C0392B" }} />Balance due</span>
          </div>
          {[
            { label: "Child",   value: "Mateo · 3y 6m · Meadow" },
            { label: "Plan",    value: "Part-time · MWF" },
            { label: "Allergy", value: "Dairy", red: true },
            { label: "Balance", value: "$1,120.00", red: true },
            { label: "Since",   value: "Jan 2024" },
          ].map((r) => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
              <span style={{ color: "var(--kh-ink-400)" }}>{r.label}</span>
              <span style={{ color: r.red ? "#C0392B" : "var(--kh-ink-700)", fontWeight: r.red ? 600 : 400 }}>{r.value}</span>
            </div>
          ))}

          <div style={{ marginTop: 16, fontSize: 10, fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".07em", color: "var(--kh-ink-400)", marginBottom: 10 }}>Quick actions</div>
          {["Log absence · Thursday", "Send invoice reminder", "Open family profile"].map((a) => (
            <button key={a} className="kh-btn" style={{ width: "100%", justifyContent: "flex-start", marginBottom: 6, fontSize: 12 }}>
              {a.startsWith("Log") ? "📅" : a.startsWith("Send") ? "✉" : "👤"} {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
