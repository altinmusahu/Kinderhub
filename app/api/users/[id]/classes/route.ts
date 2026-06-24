import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { supabaseAdmin } from "@/lib/supabase-admin"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await getTenant()
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from("classes")
      .select(`
        id,
        name,
        average_year,
        starts_at,
        ends_at,
        capacity,
        locations ( name )
      `)
      .or(`lead_user_id.eq.${id},assistant_user_id.eq.${id}`)

    if (error) throw new Error(error.message)
    return NextResponse.json(data ?? [])
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
