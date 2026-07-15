import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyToken, cookieName } from "@/lib/auth"
import { hasAnyAccess, getMyPermissionLevel } from "@/lib/permissions/can"
import { AccessDenied } from "@/app/components/dashboard/AccessDenied"
import ClassMenusClient from "./ClassMenusClient"

export default async function ClassMenusPage() {
  const store = await cookies()
  const token = store.get(cookieName())?.value ?? null
  if (!token) redirect("/login")
  const session = await verifyToken(token)
  if (!session) redirect("/login")

  const allowed = await hasAnyAccess(session, "curriculum")
  if (!allowed) return <AccessDenied />

  const level = await getMyPermissionLevel(session, "curriculum")
  const readOnly = level === "view"

  return <ClassMenusClient readOnly={readOnly} />
}
