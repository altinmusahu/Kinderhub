import { ActivitiesService } from "@/app/api/modules/activities/activities.service"
import { getTenant } from "@/lib/get-tenant"

export type ActivityItem = {
  id: string
  activity: string
  created_at: string
  dotColor: string
  timeAgo: string
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export async function fetchActivityItems(): Promise<{ items: ActivityItem[]; error: string | null }> {
  try {
    const { tenant_id } = await getTenant()
    const raw = await ActivitiesService.getAll(tenant_id)
    const items = raw
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50)
      .map(a => ({
        id: a.id,
        activity: a.activity,
        created_at: a.created_at,
        dotColor: dotColor(a.activity),
        timeAgo: timeAgo(a.created_at),
      }))
    return { items, error: null }
  } catch (e) {
    return { items: [], error: e instanceof Error ? e.message : String(e) }
  }
}
