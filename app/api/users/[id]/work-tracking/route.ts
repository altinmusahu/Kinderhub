import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { can } from "@/lib/permissions/can"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "staff", "edit", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to update this staff member's employment record" }, { status: 403 })

    const body = await req.json()

    // Verify user belongs to tenant
    const { data: userCheck } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", id)
      .eq("tenant_id", session.tenant_id)
      .maybeSingle()

    if (!userCheck) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Close the current open record (end_date is null) by setting end_date = now
    await supabaseAdmin
      .from("work_tracking")
      .update({ end_date: new Date().toISOString().slice(0, 10) })
      .eq("user_id", id)
      .is("end_date", null)

    // Insert new record
    const { data, error } = await supabaseAdmin
      .from("work_tracking")
      .insert({
        user_id:       id,
        position_name: body.position_name ?? null,
        start_date:    body.start_date    ?? null,
        department_id: body.department_id ?? null,
        end_date:      null,
      })
      .select(`
        id, position_name, start_date, end_date,
        department_id, responsible_user_id,
        department:departments (name)
      `)
      .single()

    if (error) throw new Error(error.message)

    // Resolve the staff member's name for the activity message
    const { data: staffUser } = await supabaseAdmin
      .from("users")
      .select("name, lastname")
      .eq("id", id)
      .single()
    const staffName = staffUser ? `${staffUser.name} ${staffUser.lastname}` : undefined

    logActivity(session, "updated", "Work tracking record", staffName)
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from("work_tracking")
      .select(`
        id,
        position_name,
        start_date,
        end_date,
        department_id,
        responsible_user_id,
        department:departments (name)
      `)
      .eq("user_id", id)
      .order("start_date", { ascending: false })

    if (error) throw new Error(error.message)

    // Verify user belongs to tenant
    const { data: userCheck } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .maybeSingle()

    if (!userCheck) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(data ?? [])
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
