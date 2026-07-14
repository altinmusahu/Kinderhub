import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { KidsService } from "../modules/kids/kids.service"
import { can } from "@/lib/permissions/can"

export async function POST(req: NextRequest) {
  try {
    const session = await getTenant()
    const body = await req.json()

    const allowed = await can(session, "families", "edit", body.family_id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to add a child to this family" }, { status: 403 })

    const { data, error } = await supabaseAdmin
      .from("kids")
      .insert({
        family_id:       body.family_id,
        firstname:       body.firstname,
        lastname:        body.lastname,
        date_of_birth:   body.date_of_birth,
        gender:          body.gender          ?? "Other",
        personal_number: body.personal_number ?? null,
        class_id:        body.class_id        ?? null,
        tenant_id:       session.tenant_id,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    logActivity(session, "added", "Child", `${body.firstname} ${body.lastname}`)
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function GET() {
  try {
    const { tenant_id } = await getTenant()
    const kidsWithClassIdNull = await KidsService.getKidsWithClassIdNull(tenant_id)
    return NextResponse.json(kidsWithClassIdNull)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status })
  }
}