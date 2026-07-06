import { NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"

export async function GET() {
  try {
    const { sub, email, tenant_id, role } = await getTenant()
    return NextResponse.json({ sub, email, tenant_id, role })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
