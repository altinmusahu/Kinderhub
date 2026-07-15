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

// Resources where "own_only" means a direct ownership match (e.g. classes.lead_user_id / staff.id
// equal to the logged-in user), selectable from the Roles & Permissions UI. Other resources may
// still resolve "own_only" internally (derived via a class/kid lookup, e.g. curriculum, incidents)
// for roles configured before this restriction, but that level is no longer offered as a new choice.
export const OWN_ONLY_RESOURCES: ResourceKey[] = ["classes", "staff"]

export function supportsOwnOnly(resource: ResourceKey): boolean {
  return OWN_ONLY_RESOURCES.includes(resource)
}

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
