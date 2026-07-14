import { supabaseAdmin } from "@/lib/supabase-admin"
import type { SessionPayload } from "@/lib/auth"
import type { PermissionLevel, ResourceKey } from "./resources"
import { getOwnershipChecker, type DocumentSubject, type ClassScoped } from "./ownership"

export type PermissionAction = "view" | "edit" | "full"

async function getPermissionLevel(session: SessionPayload, resource: ResourceKey): Promise<PermissionLevel> {
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("role_id")
    .eq("id", session.sub)
    .eq("tenant_id", session.tenant_id)
    .maybeSingle()
  if (userError) throw new Error(userError.message)
  if (!user?.role_id) return "none"

  const { data: perm, error: permError } = await supabaseAdmin
    .from("role_permissions")
    .select("level")
    .eq("role_id", user.role_id)
    .eq("resource", resource)
    .maybeSingle()
  if (permError) throw new Error(permError.message)

  return (perm?.level as PermissionLevel | undefined) ?? "none"
}

// Page-level "can I even load this page" check — true for any level except "none".
// Doesn't require an ownerCheckId: own_only roles should still reach the page and see
// whatever their own-scoped content ends up being, same as how Sidebar.tsx decides
// whether to show a nav item at all.
export async function hasAnyAccess(session: SessionPayload, resource: ResourceKey): Promise<boolean> {
  const level = await getPermissionLevel(session, resource)
  return level !== "none"
}

export async function can(
  session: SessionPayload,
  resource: ResourceKey,
  action: PermissionAction,
  ownerCheckId?: string | DocumentSubject | ClassScoped
): Promise<boolean> {
  const level = await getPermissionLevel(session, resource)

  switch (level) {
    case "none":
      return false
    case "full":
      return true
    case "view":
      return action === "view"
    case "edit":
      return action === "view" || action === "edit"
    case "own_only": {
      const checker = getOwnershipChecker(resource)
      if (!checker) {
        throw new Error(`No ownership checker registered for resource "${resource}" — can't resolve an "own_only" permission level.`)
      }
      if (!ownerCheckId) {
        throw new Error(`ownerCheckId is required to check "${resource}" when the caller's role level is "own_only".`)
      }
      // own_only implies edit-level access to the caller's own records; "full"-only actions (e.g. delete) are still denied.
      if (action === "full") return false
      return checker(session, ownerCheckId)
    }
    default:
      return false
  }
}
