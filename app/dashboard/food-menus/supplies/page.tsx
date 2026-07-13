import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyToken, cookieName } from "@/lib/auth"
import { FoodSuppliesService } from "@/app/api/modules/food_supplies/food_supplies.service"
import { SuppliesClient } from "./SuppliesClient"

export default async function SuppliesPage() {
  const store = await cookies()
  const token = store.get(cookieName())?.value ?? null
  if (!token) redirect("/login")

  const session = await verifyToken(token)
  if (!session) redirect("/login")

  const supplies = await FoodSuppliesService.getAllForTenant(session.tenant_id)

  return <SuppliesClient initialSupplies={supplies} />
}
