"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import MobileMenuButton from "@/app/components/dashboard/MobileMenuButton"

const settingsNav = [
  {
    section: "Organization",
    items: [
      { label: "General",   href: "/dashboard/settings/general"   },
      { label: "Currency", href: "/dashboard/settings/currency" },
      { label: "Locations", href: "/dashboard/settings/locations" },
    ],
  },
  {
    section: "People",
    items: [
      { label: "Team & access",      href: "/dashboard/settings/team"        },
      { label: "Roles & permissions",href: "/dashboard/settings/roles"       },
      { label: "Invitations",        href: "/dashboard/settings/invitations" },
    ],
  },
  {
    section: "Documents",
    items: [
      { label: "Contract Templates", href: "/dashboard/settings/contract-templates" },
    ],
  },
  {
    section: "Policies",
    items: [
      { label: "Parent portal",  href: "/dashboard/settings/parent-portal"  },
      { label: "Notifications",  href: "/dashboard/settings/notifications"  },
      { label: "Data & privacy", href: "/dashboard/settings/data-privacy"   },
      { label: "Integrations",   href: "/dashboard/settings/integrations"   },
      { label: "Billing plan",   href: "/dashboard/settings/billing-plan"   },
    ],
  },
]

const allItems = settingsNav.flatMap(g => g.items)

export default function SettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="kh-page" style={{ overflow: "hidden" }}>
      <header className="kh-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MobileMenuButton />
          <nav className="kh-breadcrumb">
            <span className="kh-breadcrumb-parent">Kinderhub</span>
            <span className="kh-breadcrumb-sep">/</span>
            <span className="kh-breadcrumb-current">Settings</span>
          </nav>
        </div>
      </header>

      {/* Mobile: horizontal scrollable tab strip */}
      <div className="kh-settings-tabs-wrap" style={{
        borderBottom: "1px solid var(--kh-border)",
        background: "var(--kh-ink-50)",
        display: "none",
      }}
        // shown via CSS at ≤767px
        id="kh-settings-mobile-nav"
      >
        <div style={{ display: "flex", gap: 2, padding: "8px 10px", minWidth: "max-content" }}>
          {allItems.map(({ label, href }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 12.5,
                fontWeight: active ? 600 : 400, whiteSpace: "nowrap",
                textDecoration: "none",
                background: active ? "var(--kh-paper)" : "transparent",
                color: active ? "var(--kh-ink-900)" : "var(--kh-ink-600)",
                border: active ? "1px solid var(--kh-border)" : "1px solid transparent",
                transition: "all 120ms",
              }}>
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Desktop: sidebar + content */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", flex: 1, minHeight: 0, overflow: "hidden" }}
        className="kh-settings-body"
      >
        <aside style={{
          borderRight: "1px solid var(--kh-border)",
          background: "var(--kh-ink-50)",
          padding: "14px 10px",
          overflowY: "auto",
          flexShrink: 0,
        }}>
          {settingsNav.map(({ section, items }) => (
            <div key={section}>
              <div style={{
                fontSize: 10.5, color: "var(--kh-ink-400)",
                fontFamily: "var(--kh-font-mono)", textTransform: "uppercase",
                letterSpacing: ".06em", padding: "14px 10px 8px",
              }}>
                {section}
              </div>
              {items.map(({ label, href }) => {
                const active = pathname === href
                return (
                  <Link key={href} href={href} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 10px", borderRadius: "var(--kh-radius-sm)",
                    fontSize: 13, cursor: "pointer", textDecoration: "none",
                    background: active ? "var(--kh-paper-2)" : "transparent",
                    color: active ? "var(--kh-ink-900)" : "var(--kh-ink-600)",
                    fontWeight: active ? 600 : 400,
                    transition: "background 120ms",
                  }}>
                    {label}
                  </Link>
                )
              })}
            </div>
          ))}
        </aside>

        <main style={{ overflow: "auto", padding: "22px 28px 40px" }}>
          {children}
        </main>
      </div>
    </div>
  )
}
