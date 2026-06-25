"use client"

import { useState, useEffect, type ReactNode } from "react"
import Sidebar from "./Sidebar"
import ActivityPanel from "./ActivityPanel"
import type { ActivityItem } from "./ActivityFeed"

type Props = {
  activityItems: ActivityItem[]
  activityError: string | null
  children: ReactNode
}

export default function DashboardShell({ activityItems, activityError, children }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activityCollapsed, setActivityCollapsed] = useState(false)
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

  // Avoid layout flash before localStorage is read
  if (!mounted) return (
    <div className="kh-app">
      <div style={{ width: 200, flexShrink: 0 }} />
      <div className="kh-main" style={{ marginLeft: 200, marginRight: 260 }}>{children}</div>
      <div style={{ width: 260, flexShrink: 0 }} />
    </div>
  )

  return (
    <div className="kh-app">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div
        className="kh-main"
        style={{ marginLeft: leftW, marginRight: rightW, transition: "margin 220ms ease" }}
      >
        {children}
      </div>
      <ActivityPanel
        items={activityItems}
        debugError={activityError}
        collapsed={activityCollapsed}
        onToggle={toggleActivity}
      />
    </div>
  )
}
