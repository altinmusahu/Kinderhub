import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyToken, cookieName } from "@/lib/auth"
import { FoodSuppliesService } from "@/app/api/modules/food_supplies/food_supplies.service"
import { hasAnyAccess, getMyPermissionLevel } from "@/lib/permissions/can"
import { AccessDenied } from "@/app/components/dashboard/AccessDenied"
import { SuppliesClient } from "./SuppliesClient"

export default async function SuppliesPage() {
  const store = await cookies()
  const token = store.get(cookieName())?.value ?? null
  if (!token) redirect("/login")

  const session = await verifyToken(token)
  if (!session) redirect("/login")

  const allowed = await hasAnyAccess(session, "food_supplies")
  if (!allowed) return <AccessDenied />

  const level = await getMyPermissionLevel(session, "food_supplies")
  const canEdit = level === "edit" || level === "full"
  const canDelete = level === "full"

  const supplies = await FoodSuppliesService.getAllForTenant(session.tenant_id)

  return <SuppliesClient initialSupplies={supplies} canEdit={canEdit} canDelete={canDelete} />
}
