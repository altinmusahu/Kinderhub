import { NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const { tenant_id } = await getTenant()

    const { data: classes, error: classErr } = await supabaseAdmin
      .from("classes")
      .select(`
        id, name, average_year, capacity,
        locations ( name ),
        lead:users!classes_lead_user_id_fkey ( name, lastname )
      `)
      .order("name", { ascending: true })

    if (classErr) throw new Error(classErr.message)

    const { data: kids, error: kidsErr } = await supabaseAdmin
      .from("kids")
      .select("class_id")
      .eq("tenant_id", tenant_id)
      .not("class_id", "is", null)

    if (kidsErr) throw new Error(kidsErr.message)

    const enrolledByClass: Record<string, number> = {}
    for (const kid of kids ?? []) {
      if (kid.class_id) enrolledByClass[kid.class_id] = (enrolledByClass[kid.class_id] ?? 0) + 1
    }

    const result = (classes ?? []).map(c => ({
      id:            c.id,
      name:          c.name,
      average_year:  c.average_year,
      capacity:      c.capacity,
      enrolled:      enrolledByClass[c.id] ?? 0,
      // lead_name:     c.lead ? `${c.lead.name} ${c.lead.lastname}` : null,
      // location_name: c.locations?.name ?? null,
    }))

    return NextResponse.json(result)
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
