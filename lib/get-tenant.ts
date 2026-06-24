import { cookies } from "next/headers"
import { verifyToken, cookieName } from "./auth"
import type { SessionPayload } from "./auth"

export async function getTenant(): Promise<SessionPayload> {
  const store = await cookies()
  const token = store.get(cookieName())?.value
  if (!token) throw new Error("Unauthorized")
  const payload = await verifyToken(token)
  if (!payload) throw new Error("Unauthorized")
  return payload
}
