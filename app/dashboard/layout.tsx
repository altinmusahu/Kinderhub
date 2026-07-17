import type { ReactNode } from "react"
import DashboardShell from "@/app/components/dashboard/DashboardShell"
import { fetchActivityItems } from "@/app/components/dashboard/ActivityFeed"
import { getTenant } from "@/lib/get-tenant"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { UserProfilesService } from "@/app/api/modules/user_profiles/user_profiles.service"
import { UserProfilesRepository } from "@/app/api/modules/user_profiles/user_profiles.repository"
import { RESOURCES, type PermissionLevel, type ResourceKey } from "@/lib/permissions/resources"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { items, error } = await fetchActivityItems()

  const session = await getTenant()
  const [{ data: userRow }, profile, familiesCount, staffCount, classesCount] = await Promise.all([
    supabaseAdmin
      .from("users")
      .select("name, lastname, role_id")
      .eq("id", session.sub)
      .eq("tenant_id", session.tenant_id)
      .maybeSingle(),
    UserProfilesService.getByUser(session.sub).catch(() => null),
    supabaseAdmin.from("families").select("id", { count: "exact", head: true }).eq("tenant_id", session.tenant_id)
      .then(({ count }) => count ?? 0),
    supabaseAdmin.from("users").select("id", { count: "exact", head: true }).eq("tenant_id", session.tenant_id)
      .then(({ count }) => count ?? 0),
    // classes aren't tenant-scoped in the schema yet (matches ClassesRepository.findAll elsewhere)
    supabaseAdmin.from("classes").select("id", { count: "exact", head: true })
      .then(({ count }) => count ?? 0),
  ])

  const navCounts = { families: familiesCount, staff: staffCount, classes: classesCount }

  const currentUser = {
    name: userRow ? `${userRow.name} ${userRow.lastname}` : session.email,
    avatarUrl: profile ? UserProfilesRepository.getPublicUrl(profile.file_url) : null,
  }

  const permissions: Record<ResourceKey, PermissionLevel> = Object.fromEntries(
    RESOURCES.map((r) => [r.key, "none" as PermissionLevel])
  ) as Record<ResourceKey, PermissionLevel>

  if (userRow?.role_id) {
    const { data: rolePerms } = await supabaseAdmin
      .from("role_permissions")
      .select("resource, level")
      .eq("role_id", userRow.role_id)
    for (const row of rolePerms ?? []) {
      if (row.resource in permissions) permissions[row.resource as ResourceKey] = row.level as PermissionLevel
    }
  }

  return (
    <DashboardShell activityItems={items} activityError={error} currentUser={currentUser} permissions={permissions} navCounts={navCounts}>
      {children}
    </DashboardShell>
  )
}
