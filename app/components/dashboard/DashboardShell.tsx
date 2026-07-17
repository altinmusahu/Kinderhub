"use client"

import { useState, useEffect, type ReactNode } from "react"
import Sidebar from "./Sidebar"
import ActivityPanel from "./ActivityPanel"
import GlobalSearch from "./GlobalSearch"
import type { ActivityItem } from "./ActivityFeed"
import { MobileNavContext } from "./MobileNavContext"
import type { PermissionLevel, ResourceKey } from "@/lib/permissions/resources"

type Props = {
  activityItems: ActivityItem[]
  activityError: string | null
  currentUser: { name: string; avatarUrl: string | null }
  permissions: Record<ResourceKey, PermissionLevel>
  navCounts: { families: number; staff: number; classes: number }
  children: ReactNode
}

export default function DashboardShell({ activityItems, activityError, currentUser, permissions, navCounts, children }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activityCollapsed, setActivityCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const s = localStorage.getItem("kh-sidebar-collapsed")
      const a = localStorage.getItem("kh-activity-collapsed")
      if (s !== null) setSidebarCollapsed(s === "true")
      if (a !== null) setActivityCollapsed(a === "true")
    } catch {}
    setMounted(true)
  }, [])

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  function toggleSidebar() {
    setSidebarCollapsed(v => {
      const next = !v
      try { localStorage.setItem("kh-sidebar-collapsed", String(next)) } catch {}
      return next
    })
  }

  function toggleActivity() {
    setActivityCollapsed(v => {
      const next = !v
      try { localStorage.setItem("kh-activity-collapsed", String(next)) } catch {}
      return next
    })
  }

  const leftW  = sidebarCollapsed  ? "52px" : "200px"
  const rightW = activityCollapsed ? "52px" : "260px"

  return (
    <MobileNavContext.Provider value={{ openMobileNav: () => setMobileOpen(true) }}>
      <div className="kh-app" suppressHydrationWarning>
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="kh-sidebar-overlay"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          currentUser={currentUser}
          permissions={permissions}
          navCounts={navCounts}
        />

        <div
          className="kh-main"
          style={{
            marginLeft: leftW,
            marginRight: rightW,
            transition: "margin 220ms ease",
            opacity: mounted ? 1 : 0,
          }}
        >
          <div className="kh-global-search-bar">
            <GlobalSearch />
          </div>
          {children}
        </div>

        <ActivityPanel
          items={activityItems}
          debugError={activityError}
          collapsed={activityCollapsed}
          onToggle={toggleActivity}
        />
      </div>
    </MobileNavContext.Provider>
  )
}
