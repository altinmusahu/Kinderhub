import { NextResponse } from "next/server"
import { cookieName, cookieOptions } from "@/lib/auth"

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(cookieName(), "", { ...cookieOptions(0), maxAge: 0 })
  return response
}
