import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { verifyToken, cookieName } from "@/lib/auth"
import { hasAnyAccess } from "@/lib/permissions/can"
import { AccessDenied } from "@/app/components/dashboard/AccessDenied"

export default async function MessagesLayout({ children }: { children: ReactNode }) {
  const store = await cookies()
  const token = store.get(cookieName())?.value ?? null
  if (!token) redirect("/login")
  const session = await verifyToken(token)
  if (!session) redirect("/login")

  const allowed = await hasAnyAccess(session, "messages")
  if (!allowed) return <AccessDenied />

  return children
}
