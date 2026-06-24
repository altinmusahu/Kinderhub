import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    await getTenant()
    const { data, error } = await supabaseAdmin
      .from("classes")
      .select("*, locations(name)")
    if (error) throw new Error(error.message)
    return NextResponse.json(data ?? [])
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    await getTenant()
    const body = await req.json()
    const { data, error } = await supabaseAdmin
      .from("classes")
      .insert({
        name: body.name,
        average_year: body.average_year,
        location_id: body.location_id,
        starts_at: body.starts_at,
        ends_at: body.ends_at,
        capacity: body.capacity,
        lead_user_id: body.lead_user_id,
        assistant_user_id: body.assistant_user_id,
      })
      .select().single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
