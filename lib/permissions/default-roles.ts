import type { PermissionLevel, ResourceKey } from "./resources"

export type DefaultRole = {
  name: string
  color: string
  is_system: boolean
  is_owner_role: boolean
  permissions: Record<ResourceKey, PermissionLevel>
}

export const DEFAULT_ROLES: DefaultRole[] = [
  {
    name: "Owner",
    color: "#8B5CF6",
    is_system: true,
    is_owner_role: true,
    permissions: {
      families: "full",
      children: "full",
      staff: "full",
      classes: "full",
      attendance: "full",
      incidents: "full",
      curriculum: "full",
      hub: "full",
      documents: "full",
      food_supplies: "full",
      billing: "full",
      messages: "full",
      calendar: "full",
      settings: "full",
      legal_entity: "full",
    },
  },
  {
    name: "Admin",
    color: "#F59E0B",
    is_system: true,
    is_owner_role: false,
    permissions: {
      families: "full",
      children: "full",
      staff: "full",
      classes: "full",
      attendance: "full",
      incidents: "full",
      curriculum: "full",
      hub: "full",
      documents: "full",
      food_supplies: "full",
      billing: "full",
      messages: "full",
      calendar: "full",
      settings: "full",
      legal_entity: "none",
    },
  },
  {
    name: "Lead Teacher",
    color: "#3B82F6",
    is_system: true,
    is_owner_role: false,
    permissions: {
      families: "own_only",   // view (own_only)
      children: "own_only",   // edit (own_only)
      staff: "none",
      classes: "own_only",    // full (own_only)
      attendance: "own_only", // full (own_only)
      incidents: "own_only",  // full (own_only)
      curriculum: "own_only", // full (own_only)
      hub: "own_only",        // full (own_only)
      documents: "own_only",  // view (own_only)
      food_supplies: "none",
      billing: "none",
      messages: "edit",
      calendar: "edit",
      settings: "none",
      legal_entity: "none",
    },
  },
  {
    name: "Assistant",
    color: "#10B981",
    is_system: true,
    is_owner_role: false,
    permissions: {
      families: "own_only",   // view (own_only)
      children: "own_only",   // view (own_only)
      staff: "none",
      classes: "own_only",    // edit (own_only)
      attendance: "own_only", // edit (own_only)
      incidents: "own_only",  // edit (own_only)
      curriculum: "own_only", // view (own_only)
      hub: "own_only",        // edit (own_only)
      documents: "own_only",  // view (own_only)
      food_supplies: "none",
      billing: "none",
      messages: "view",
      calendar: "view",
      settings: "none",
      legal_entity: "none",
    },
  },
  {
    name: "Staff",
    color: "#6B7280",
    is_system: true,
    is_owner_role: false,
    permissions: {
      families: "none",
      children: "none",
      staff: "own_only",      // view (own_only)
      classes: "none",
      attendance: "none",
      incidents: "none",
      curriculum: "none",
      hub: "none",
      documents: "none",
      food_supplies: "full",
      billing: "none",
      messages: "none",
      calendar: "view",
      settings: "none",
      legal_entity: "none",
    },
  },
]
