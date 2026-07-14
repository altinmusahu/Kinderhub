"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard, Users, UserSquare2, BookOpen,
  Receipt, MessageSquare, FileText, Calendar, Settings,
  PanelLeftClose, PanelLeftOpen, X, Utensils, LogOut,
} from "lucide-react"
import type { PermissionLevel, ResourceKey } from "@/lib/permissions/resources"

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
  { href: "/dashboard",           icon: LayoutDashboard, label: "Overview",  badge: null, resources: null },
  { href: "/dashboard/families",  icon: Users,           label: "Families",  badge: 124,  resources: ["families"] },
  { href: "/dashboard/staff",     icon: UserSquare2,     label: "Staff",     badge: 18,   resources: ["staff"] },
  { href: "/dashboard/classes",   icon: BookOpen,        label: "Classes",   badge: 5,    resources: ["classes"] },
  { href: "/dashboard/food-menus", icon: Utensils,       label: "Food & menus", badge: null, resources: ["food_supplies", "curriculum"] },
  { href: "/dashboard/billing",   icon: Receipt,         label: "Billing",   badge: 9,    resources: ["billing"] },
  { href: "/dashboard/messages",  icon: MessageSquare,   label: "Messages",  badge: 3,    resources: ["messages"] },
  { href: "/dashboard/documents", icon: FileText,        label: "Documents", badge: null, resources: ["documents"] },
] satisfies { href: string; icon: typeof Users; label: string; badge: number | null; resources: ResourceKey[] | null }[]

const TOOLS_ITEMS = [
  { href: "/dashboard/calendar", icon: Calendar, label: "Calendar", resources: ["calendar"] },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", resources: ["settings"] },
] satisfies { href: string; icon: typeof Calendar; label: string; resources: ResourceKey[] | null }[]

// A nav item is visible if it has no resource gate, or at least one of its resources is above "none"
function isVisible(resources: ResourceKey[] | null, permissions: Record<ResourceKey, PermissionLevel>): boolean {
  if (!resources) return true
  return resources.some((r) => permissions[r] !== "none")
}

type Props = {
  collapsed: boolean
  onToggle: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
  currentUser: { name: string; avatarUrl: string | null }
  permissions: Record<ResourceKey, PermissionLevel>
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
  return `${first}${last}`.toUpperCase()
}

function SidebarAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  return (
    <div className="kh-avatar kh-avatar--sage" title={name} style={{ overflow: "hidden" }}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initialsFromName(name)
      )}
    </div>
  )
}

export default function Sidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose, currentUser, permissions }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  // On mobile the sidebar is never "collapsed" — it's full width when open
  const isMobileExpanded = mobileOpen

  // Determine if labels should show: desktop expanded OR mobile open
  const showLabels = isMobileExpanded || !collapsed

  const workspaceItems = WORKSPACE_ITEMS.filter((item) => isVisible(item.resources, permissions))
  const toolsItems = TOOLS_ITEMS.filter((item) => isVisible(item.resources, permissions))

  function handleNavClick() {
    onMobileClose?.()
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // proceed with client-side cleanup regardless of network failure
    }

    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch {}

    // Clear any non-httpOnly cookies still readable from the client (the auth cookie itself is
    // httpOnly and already cleared server-side by /api/auth/logout above).
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim()
      if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    })

    router.push("/login")
    router.refresh()
  }

  return (
    <aside
      className={[
        "kh-sidebar",
        collapsed && !mobileOpen ? "kh-sidebar--collapsed" : "",
        mobileOpen ? "kh-sidebar--mobile-open" : "",
      ].filter(Boolean).join(" ")}
    >
      {/* Logo row */}
      <div className="kh-sidebar-logo" style={{ justifyContent: !showLabels ? "center" : undefined }}>
        {showLabels && <ArchMarkSVG size={28} />}
        {showLabels && <span className="kh-logo-wordmark">kinder<em>hub</em></span>}

        {/* Mobile: close X button */}
        {mobileOpen ? (
          <button
            onClick={onMobileClose}
            className="kh-sidebar-toggle"
            style={{ margin: 0 }}
            title="Close menu"
          >
            <X size={15} />
          </button>
        ) : (
          /* Desktop: collapse toggle */
          <button
            onClick={onToggle}
            className="kh-sidebar-toggle"
            style={{ margin: !showLabels ? 0 : undefined }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed
              ? <PanelLeftOpen size={15} />
              : <PanelLeftClose size={15} />
            }
          </button>
        )}
      </div>

      {/* Workspace */}
      <div className="kh-sidebar-section" style={{ flex: 1, overflowY: "auto" }}>
        {showLabels && <div className="kh-sidebar-section-label">Workspace</div>}
        <nav className="kh-sidebar-nav">
          {workspaceItems.map(({ href, icon: Icon, label, badge }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={handleNavClick}
                title={!showLabels ? label : undefined}
                className={`kh-nav-item${active ? " kh-nav-item--active" : ""}${!showLabels ? " kh-nav-item--icon-only" : ""}`}
              >
                <Icon size={15} className="kh-nav-icon" />
                {showLabels && <span className="kh-nav-label">{label}</span>}
                {showLabels && badge !== null && <span className="kh-nav-badge">{badge}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Tools */}
      <div className="kh-sidebar-section">
        {showLabels && <div className="kh-sidebar-section-label">Tools</div>}
        <nav className="kh-sidebar-nav">
          {toolsItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={handleNavClick}
                title={!showLabels ? label : undefined}
                className={`kh-nav-item${active ? " kh-nav-item--active" : ""}${!showLabels ? " kh-nav-item--icon-only" : ""}`}
              >
                <Icon size={15} className="kh-nav-icon" />
                {showLabels && <span className="kh-nav-label">{label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User */}
      {showLabels ? (
        <div className="kh-sidebar-user">
          <SidebarAvatar name={currentUser.name} avatarUrl={currentUser.avatarUrl} />
          <div className="kh-sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
            <div className="kh-sidebar-user-name">{currentUser.name}</div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="kh-sidebar-toggle"
            title="Log out"
            style={{ flexShrink: 0 }}
          >
            <LogOut size={14} />
          </button>
        </div>
      ) : (
        <div className="kh-sidebar-user" style={{ flexDirection: "column", gap: 8, padding: "12px 0" }}>
          <SidebarAvatar name={currentUser.name} avatarUrl={currentUser.avatarUrl} />
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="kh-sidebar-toggle"
            title="Log out"
          >
            <LogOut size={14} />
          </button>
        </div>
      )}
    </aside>
  )
}
