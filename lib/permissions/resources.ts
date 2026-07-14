export const RESOURCES = [
  { key: "families", label: "Families" },
  { key: "staff", label: "Staff" },
  { key: "classes", label: "Classes" },
  { key: "attendance", label: "Attendance" },
  { key: "incidents", label: "Incidents" },
  { key: "curriculum", label: "Curriculum & Checklist" },
  { key: "hub", label: "Class Hub" },
  { key: "documents", label: "Documents" },
  { key: "food_supplies", label: "Food & Supplies" },
  { key: "billing", label: "Billing" },
  { key: "messages", label: "Messages" },
  { key: "calendar", label: "Calendar" },
  { key: "settings", label: "Settings" },
  { key: "legal_entity", label: "Legal & Registration" },
] as const

export type ResourceKey = typeof RESOURCES[number]["key"]
export type PermissionLevel = "none" | "view" | "edit" | "full" | "own_only"

export const PERMISSION_LEVELS: { value: PermissionLevel; label: string }[] = [
  { value: "none", label: "No access" },
  { value: "view", label: "View" },
  { value: "edit", label: "Edit" },
  { value: "full", label: "Full" },
  { value: "own_only", label: "Own only" },
]

export function isResourceKey(value: string): value is ResourceKey {
  return RESOURCES.some((r) => r.key === value)
}
