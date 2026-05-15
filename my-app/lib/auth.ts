const COOKIE_NAME = "auth_token"
const EXPIRES_MS = 8 * 60 * 60 * 1000 // 8 hours

export interface SessionPayload {
  sub: string
  email: string
  tenant_id: string
  role: string
  exp: number
}

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.JWT_SECRET ?? "change-this-secret-in-production"
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  )
}

function toB64Url(bytes: Uint8Array): string {
  let str = ""
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function fromB64Url(str: string): Uint8Array {
  const raw = atob(str.replace(/-/g, "+").replace(/_/g, "/"))
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export async function signToken(payload: Omit<SessionPayload, "exp">): Promise<string> {
  const full: SessionPayload = { ...payload, exp: Date.now() + EXPIRES_MS }
  const enc = new TextEncoder()
  const key = await getKey()
  const header = toB64Url(enc.encode(JSON.stringify({ alg: "HS256" })))
  const body = toB64Url(enc.encode(JSON.stringify(full)))
  const message = `${header}.${body}`
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message))
  return `${message}.${toB64Url(new Uint8Array(sig))}`
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const [header, body, sig] = parts
    const key = await getKey()
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromB64Url(sig).buffer as ArrayBuffer,
      new TextEncoder().encode(`${header}.${body}`)
    )
    if (!valid) return null
    const payload: SessionPayload = JSON.parse(
      new TextDecoder().decode(fromB64Url(body))
    )
    if (Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export function cookieName() {
  return COOKIE_NAME
}

export function cookieOptions(maxAge = EXPIRES_MS / 1000) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  }
}
