import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { WaitlistService } from "@/app/api/modules/waitlist/waitlist.service"
import { can } from "@/lib/permissions/can"
import { supabaseAdmin } from "@/lib/supabase-admin"

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const { data: entry } = await supabaseAdmin
      .from("waitlists")
      .select("class_id")
      .eq("id", id)
      .eq("tenant_id", session.tenant_id)
      .maybeSingle()
    if (!entry) return NextResponse.json({ error: "Waitlist entry not found" }, { status: 404 })

    const allowed = await can(session, "classes", "full", entry.class_id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to manage this class's waitlist" }, { status: 403 })

    await WaitlistService.delete(id, session.tenant_id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status })
  }
}
