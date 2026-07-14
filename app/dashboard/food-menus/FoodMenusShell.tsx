"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import MobileMenuButton from "@/app/components/dashboard/MobileMenuButton"

const TABS = [
  { href: "/dashboard/food-menus/supplies", label: "Supplies" },
  { href: "/dashboard/food-menus/menus", label: "Menus" },
]

export default function FoodMenusShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const activeTab = TABS.find(t => pathname.startsWith(t.href)) ?? TABS[0]

  return (
    <div className="kh-page">
      <header className="kh-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MobileMenuButton />
          <nav className="kh-breadcrumb">
            <span className="kh-breadcrumb-parent">Kinderhub</span>
            <span className="kh-breadcrumb-sep">/</span>
            <span className="kh-breadcrumb-parent">Food & menus</span>
            <span className="kh-breadcrumb-sep">/</span>
            <span className="kh-breadcrumb-current">{activeTab.label}</span>
          </nav>
        </div>
      </header>

      <div className="no-print" style={{ display: "flex", alignItems: "center", background: "var(--kh-surface)", borderBottom: "1px solid var(--kh-ink-100)" }}>
        <div style={{ display: "flex", gap: 18, padding: "0 28px" }}>
          {TABS.map(tab => {
            const active = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  padding: "12px 2px", fontSize: 13, textDecoration: "none",
                  color: active ? "var(--kh-ink-900)" : "var(--kh-ink-500)",
                  fontWeight: active ? 600 : 500,
                  borderBottom: active ? "2px solid var(--kh-peach)" : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="kh-content">
        {children}
      </div>
    </div>
  )
}
