"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Users, UserSquare2, BookOpen,
  Receipt, MessageSquare, FileText, Calendar, Settings,
  PanelLeftClose, PanelLeftOpen,
} from "lucide-react"

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
  { href: "/dashboard",           icon: LayoutDashboard, label: "Overview",  badge: null },
  { href: "/dashboard/families",  icon: Users,           label: "Families",  badge: 124  },
  { href: "/dashboard/staff",     icon: UserSquare2,     label: "Staff",     badge: 18   },
  { href: "/dashboard/classes",   icon: BookOpen,        label: "Classes",   badge: 5    },
  { href: "/dashboard/billing",   icon: Receipt,         label: "Billing",   badge: 9    },
  { href: "/dashboard/messages",  icon: MessageSquare,   label: "Messages",  badge: 3    },
  { href: "/dashboard/documents", icon: FileText,        label: "Documents", badge: null },
]

const TOOLS_ITEMS = [
  { href: "/dashboard/calendar", icon: Calendar, label: "Calendar" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

type Props = { collapsed: boolean; onToggle: () => void }

export default function Sidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname()

  return (
    <aside className={`kh-sidebar${collapsed ? " kh-sidebar--collapsed" : ""}`}>

      {/* Logo row */}
      <div className="kh-sidebar-logo" style={{ justifyContent: collapsed ? "center" : undefined }}>
        {!collapsed && <ArchMarkSVG size={28} />}
        {!collapsed && <span className="kh-logo-wordmark">kinder<em>hub</em></span>}
        <button
          onClick={onToggle}
          className="kh-sidebar-toggle"
          style={{ margin: collapsed ? 0 : undefined }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <PanelLeftOpen size={15} />
            : <PanelLeftClose size={15} />
          }
        </button>
      </div>

      {/* Workspace */}
      <div className="kh-sidebar-section" style={{ flex: 1, overflowY: "auto" }}>
        {!collapsed && <div className="kh-sidebar-section-label">Workspace</div>}
        <nav className="kh-sidebar-nav">
          {WORKSPACE_ITEMS.map(({ href, icon: Icon, label, badge }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`kh-nav-item${active ? " kh-nav-item--active" : ""}${collapsed ? " kh-nav-item--icon-only" : ""}`}
              >
                <Icon size={15} className="kh-nav-icon" />
                {!collapsed && <span className="kh-nav-label">{label}</span>}
                {!collapsed && badge !== null && <span className="kh-nav-badge">{badge}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Tools */}
      <div className="kh-sidebar-section">
        {!collapsed && <div className="kh-sidebar-section-label">Tools</div>}
        <nav className="kh-sidebar-nav">
          {TOOLS_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`kh-nav-item${active ? " kh-nav-item--active" : ""}${collapsed ? " kh-nav-item--icon-only" : ""}`}
              >
                <Icon size={15} className="kh-nav-icon" />
                {!collapsed && <span className="kh-nav-label">{label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User */}
      {!collapsed ? (
        <div className="kh-sidebar-user">
          <div className="kh-avatar kh-avatar--sage">NK</div>
          <div className="kh-sidebar-user-info">
            <div className="kh-sidebar-user-name">Nina Kowalski</div>
            <div className="kh-sidebar-user-role">Director · Mission</div>
          </div>
        </div>
      ) : (
        <div className="kh-sidebar-user" style={{ justifyContent: "center", padding: "12px 0" }}>
          <div className="kh-avatar kh-avatar--sage" title="Nina Kowalski">NK</div>
        </div>
      )}
    </aside>
  )
}
