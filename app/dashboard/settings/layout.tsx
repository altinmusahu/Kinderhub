"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

const settingsNav = [
  {
    section: "Organization",
    items: [
      { label: "General",   href: "/dashboard/settings/general"   },
      { label: "Branding",  href: "/dashboard/settings/branding"  },
      { label: "Locations", href: "/dashboard/settings/locations" },
    ],
  },
  {
    section: "People",
    items: [
      { label: "Team & access",      href: "/dashboard/settings/team"        },
      { label: "Departments",        href: "/dashboard/settings/departments" },
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

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="kh-page" style={{ overflow: "hidden" }}>
      <header className="kh-topbar">
        <nav className="kh-breadcrumb">
          <span className="kh-breadcrumb-parent">Kinderhub</span>
          <span className="kh-breadcrumb-sep">/</span>
          <span className="kh-breadcrumb-current">Settings</span>
        </nav>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", flex: 1, minHeight: 0, overflow: "hidden" }}>
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
