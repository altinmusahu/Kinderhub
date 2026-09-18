import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { can, hasAnyAccess } from "@/lib/permissions/can"
import { ParentsService } from "@/app/api/modules/parents/parents.service"

export async function GET() {
  try {
    const session = await getTenant()

    const allowed = await hasAnyAccess(session, "families")
    if (!allowed) return NextResponse.json({ error: "You don't have permission to view parents" }, { status: 403 })

    const parents = await ParentsService.getAll(session.tenant_id)
    return NextResponse.json(parents)
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getTenant()
    const body = await req.json()

    const allowed = await can(session, "families", "edit", body.family_id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to add parents to this family" }, { status: 403 })

    // A guardian only needs a custody file once they're flagged as the legal custodian —
    // it always starts unregistered so the family shows the "missing file" warrant until
    // someone actually uploads it (see documents.upload + PATCH below).
    const hasLegalCustody = body.has_legal_custody ?? null

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
        email:                           body.email             || null,
        work_phone_number:               body.work_phone_number || null,
        has_legal_custody:               hasLegalCustody,
        custody_notes:                   body.custody_notes     || null,
        has_legal_custody_file_uploaded: hasLegalCustody ? false : null,
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
