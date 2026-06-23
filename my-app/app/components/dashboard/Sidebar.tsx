"use client"

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

// Brand arch mark — arched doorway with rising sun, from Kinderhub Brand design
function ArchMarkSVG({ size = 32 }: { size?: number }) {
  const W = 120, H = 132
  const outer = "M10 124 L10 62 A50 50 0 0 1 110 62 L110 124 Z"
  const inner = "M28 124 L28 62 A32 32 0 0 1 92 62 L92 124 Z"
  const sun   = "M36 124 A24 24 0 0 1 84 124 Z"
  const sunRays = [
    "M60 84 L60 74", "M44 90 L37 83", "M76 90 L83 83",
    "M34 106 L25 104", "M86 106 L95 104",
  ]
  return (
    <svg width={size} height={size * H / W} viewBox={`0 0 ${W} ${H}`} fill="none" aria-label="Kinderhub" style={{ flexShrink: 0 }}>
      <path d={outer} fill="var(--kh-peach)" />
      <path d={inner} fill="var(--kh-sky)" />
      <path d={sun} fill="var(--kh-marigold)" style={{ mixBlendMode: "multiply" }} />
      {sunRays.map((d, i) => <path key={i} d={d} stroke="var(--kh-peach-d)" strokeWidth={5} strokeLinecap="round" opacity="0.65" />)}
      <circle cx="44" cy="50" r="5" fill="var(--kh-sage-d)" />
      <circle cx="60" cy="42" r="6" fill="var(--kh-pink)" />
      <circle cx="76" cy="50" r="5" fill="var(--kh-paper)" />
      <path d={inner} fill="none" stroke="var(--kh-peach-d)" strokeWidth="2.5" opacity="0.35" />
    </svg>
  )
}

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
        <ArchMarkSVG size={32} />
        <span className="kh-logo-wordmark">
          kinder<em>hub</em>
        </span>
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
