import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { can } from "@/lib/permissions/can"

export async function GET() {
  try {
    const { tenant_id } = await getTenant()
    const { data, error } = await supabaseAdmin
      .from("families")
      .select("*")
      .eq("tenant_id", tenant_id)
      .order("created_at", { ascending: false })
    if (error) throw new Error(error.message)
    return NextResponse.json(data ?? [])
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getTenant()

    const allowed = await can(session, "families", "edit")
    if (!allowed) return NextResponse.json({ error: "You don't have permission to add families" }, { status: 403 })

    const body = await req.json()
    const { data, error } = await supabaseAdmin
      .from("families")
      .insert({
        name:      body.name,
        status:    body.status    ?? "Active",
        plan:      body.plan      ?? "Full-time",
        balance:   body.balance   ?? 0,
        tenant_id: session.tenant_id,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    logActivity(session, "added", "Family", body.name)
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
