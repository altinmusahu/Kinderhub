import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(req: NextRequest) {
  try {
    await getTenant()
    const body = await req.json()
    const { data, error } = await supabaseAdmin
      .from("kids")
      .insert({
        family_id: body.family_id,
        firstname: body.firstname,
        lastname: body.lastname,
        date_of_birth: body.date_of_birth,
        gender: body.gender ?? "Other",
        personal_number: body.personal_number ?? null,
        class_id: body.class_id ?? null,
      })
      .select().single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
