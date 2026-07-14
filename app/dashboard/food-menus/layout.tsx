import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { verifyToken, cookieName } from "@/lib/auth"
import { hasAnyAccess } from "@/lib/permissions/can"
import { AccessDenied } from "@/app/components/dashboard/AccessDenied"
import FoodMenusShell from "./FoodMenusShell"

export default async function FoodMenusLayout({ children }: { children: ReactNode }) {
  const store = await cookies()
  const token = store.get(cookieName())?.value ?? null
  if (!token) redirect("/login")
  const session = await verifyToken(token)
  if (!session) redirect("/login")

  const [canSupplies, canCurriculum] = await Promise.all([
    hasAnyAccess(session, "food_supplies"),
    hasAnyAccess(session, "curriculum"),
  ])
  if (!canSupplies && !canCurriculum) return <AccessDenied />

  return <FoodMenusShell>{children}</FoodMenusShell>
}
