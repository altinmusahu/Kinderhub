import { ActivitiesService } from "@/app/api/modules/activities/activities.service"
import { getTenant } from "@/lib/get-tenant"
import { Activity } from "lucide-react"

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

const ENTITY_COLORS: Record<string, string> = {
  Staff:                  "var(--kh-peach)",
  Department:             "var(--kh-marigold)",
  Location:               "var(--kh-sky)",
  Family:                 "var(--kh-sage)",
  Parent:                 "var(--kh-pink)",
  Child:                  "var(--kh-marigold)",
  Class:                  "var(--kh-sky)",
  "Work tracking record": "var(--kh-ink-400)",
}

function dotColor(activity: string): string {
  for (const [key, color] of Object.entries(ENTITY_COLORS)) {
    if (activity.toLowerCase().includes(key.toLowerCase())) return color
  }
  return "var(--kh-ink-300)"
}

export default async function ActivityFeed() {
  let activities: Awaited<ReturnType<typeof ActivitiesService.getAll>> = []
  let debugError: string | null = null

  try {
    const { tenant_id } = await getTenant()
    activities = await ActivitiesService.getAll(tenant_id)
    // Most recent first, cap at 50
    activities = activities
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50)
  } catch (e) {
    debugError = e instanceof Error ? e.message : String(e)
  }

  return (
    <aside className="kh-activity-panel">
      <div className="kh-activity-panel-header">
        <Activity size={13} style={{ color: "var(--kh-peach)", flexShrink: 0 }} />
        <span className="kh-activity-panel-title">Activity</span>
      </div>

      <div className="kh-activity-panel-body">
        {debugError ? (
          <div className="kh-activity-empty" style={{ color: "var(--kh-peach)" }}>
            <p style={{ fontWeight: 600 }}>Error loading activities:</p>
            <p style={{ wordBreak: "break-all" }}>{debugError}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="kh-activity-empty">
            <p>No activity yet.</p>
            <p>Actions like adding staff or families will appear here.</p>
          </div>
        ) : (
          <ul className="kh-activity-feed">
            {activities.map((item) => (
              <li key={item.id} className="kh-activity-feed-item">
                {/* Timeline dot */}
                <div
                  className="kh-activity-feed-dot"
                  style={{ background: dotColor(item.activity) }}
                />
                <div className="kh-activity-feed-body">
                  <p className="kh-activity-feed-text">{item.activity}</p>
                  <span className="kh-activity-feed-time">{timeAgo(item.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
