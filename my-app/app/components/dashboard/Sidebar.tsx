"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  BookOpen,
  Receipt,
  MessageSquare,
  FileText,
  Calendar,
  Settings,
  Search,
} from "lucide-react"

const WORKSPACE_ITEMS = [
  { href: "/dashboard",          icon: LayoutDashboard, label: "Overview",  badge: null },
  { href: "/dashboard/families", icon: Users,           label: "Families",  badge: 124  },
  { href: "/dashboard/staff",    icon: UserSquare2,     label: "Staff",     badge: 18   },
  { href: "/dashboard/classes",  icon: BookOpen,        label: "Classes",   badge: 5    },
  { href: "/dashboard/billing",  icon: Receipt,         label: "Billing",   badge: 9    },
  { href: "/dashboard/messages", icon: MessageSquare,   label: "Messages",  badge: 3    },
  { href: "/dashboard/documents",icon: FileText,        label: "Documents", badge: null },
]

const TOOLS_ITEMS = [
  { href: "/dashboard/calendar", icon: Calendar, label: "Calendar", badge: null },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", badge: null },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="kh-sidebar">
      {/* Logo */}
      <div className="kh-sidebar-logo">
        <div className="kh-logo-mark">
          <span>K</span>
        </div>
        <div className="kh-logo-text">
          <span className="kh-logo-name">Kinderhub</span>
          <span className="kh-logo-version">V 2</span>
        </div>
      </div>

      {/* Search */}
      <div className="kh-sidebar-search">
        <Search size={13} className="kh-search-icon" />
        <span className="kh-search-placeholder">Search everything</span>
        <kbd className="kh-search-kbd">⌘K</kbd>
      </div>

      {/* Workspace */}
      <div className="kh-sidebar-section">
        <div className="kh-sidebar-section-label">Workspace</div>
        <nav className="kh-sidebar-nav">
          {WORKSPACE_ITEMS.map(({ href, icon: Icon, label, badge }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`kh-nav-item ${active ? "kh-nav-item--active" : ""}`}
              >
                <Icon size={15} className="kh-nav-icon" />
                <span className="kh-nav-label">{label}</span>
                {badge !== null && (
                  <span className="kh-nav-badge">{badge}</span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Tools */}
      <div className="kh-sidebar-section">
        <div className="kh-sidebar-section-label">Tools</div>
        <nav className="kh-sidebar-nav">
          {TOOLS_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`kh-nav-item ${active ? "kh-nav-item--active" : ""}`}
              >
                <Icon size={15} className="kh-nav-icon" />
                <span className="kh-nav-label">{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User */}
      <div className="kh-sidebar-user">
        <div className="kh-avatar kh-avatar--sage">NK</div>
        <div className="kh-sidebar-user-info">
          <div className="kh-sidebar-user-name">Nina Kowalski</div>
          <div className="kh-sidebar-user-role">Director · Mission</div>
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{marginLeft:"auto",opacity:.4}}>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </aside>
  )
}
