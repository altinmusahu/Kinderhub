import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(req: NextRequest) {
  try {
    const session = await getTenant()
    const body = await req.json()
    const { data, error } = await supabaseAdmin
      .from("parents")
      .insert({
        family_id:       body.family_id,
        firstname:       body.firstname,
        lastname:        body.lastname,
        phone_number:    body.phone_number    ?? "",
        personal_number: body.personal_number ?? "",
        date_of_birth:   body.date_of_birth,
        is_active:       body.is_active       ?? true,
        address:         body.address         ?? "",
        pick_up:         body.pick_up         ?? false,
        tenant_id:       session.tenant_id,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    logActivity(session, "added", "Parent", `${body.firstname} ${body.lastname}`)
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
