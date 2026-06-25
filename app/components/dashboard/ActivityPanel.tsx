"use client"

import { Activity, PanelRightClose, PanelRightOpen } from "lucide-react"
import type { ActivityItem } from "./ActivityFeed"

type Props = {
  items: ActivityItem[]
  debugError: string | null
  collapsed: boolean
  onToggle: () => void
}

export default function ActivityPanel({ items, debugError, collapsed, onToggle }: Props) {
  return (
    <aside className={`kh-activity-panel${collapsed ? " kh-activity-panel--collapsed" : ""}`}>

      {/* Header */}
      <div className="kh-activity-panel-header" style={{ justifyContent: collapsed ? "center" : undefined }}>
        {!collapsed && (
          <>
            <Activity size={13} style={{ color: "var(--kh-peach)", flexShrink: 0 }} />
            <span className="kh-activity-panel-title">Activity</span>
          </>
        )}
        <button
          onClick={onToggle}
          className="kh-sidebar-toggle"
          style={{ marginLeft: collapsed ? 0 : "auto" }}
          title={collapsed ? "Show activity" : "Hide activity"}
        >
          {collapsed
            ? <PanelRightOpen size={15} />
            : <PanelRightClose size={15} />
          }
        </button>
      </div>

      {/* Body — hidden when collapsed */}
      {!collapsed && (
        <div className="kh-activity-panel-body">
          {debugError ? (
            <div className="kh-activity-empty" style={{ color: "var(--kh-peach)" }}>
              <p style={{ fontWeight: 600 }}>Error loading activities:</p>
              <p style={{ wordBreak: "break-all" }}>{debugError}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="kh-activity-empty">
              <p>No activity yet.</p>
              <p>Actions like adding staff or families will appear here.</p>
            </div>
          ) : (
            <ul className="kh-activity-feed">
              {items.map(item => (
                <li key={item.id} className="kh-activity-feed-item">
                  <div className="kh-activity-feed-dot" style={{ background: item.dotColor }} />
                  <div className="kh-activity-feed-body">
                    <p className="kh-activity-feed-text">{item.activity}</p>
                    <span className="kh-activity-feed-time">{item.timeAgo}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Collapsed — show dot indicator if there are activities */}
      {collapsed && items.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--kh-peach)",
          }} />
        </div>
      )}
    </aside>
  )
}
