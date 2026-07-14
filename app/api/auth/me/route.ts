import { NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const { sub, email, tenant_id, role } = await getTenant()

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("role_id")
      .eq("id", sub)
      .eq("tenant_id", tenant_id)
      .maybeSingle()

    return NextResponse.json({ sub, email, tenant_id, role, role_id: user?.role_id ?? null })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
