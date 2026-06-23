import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    await getTenant()
    const { data, error } = await supabaseAdmin.from("families").select("*").order("created_at", { ascending: false })
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
      .from("families")
      .insert({ name: body.name, status: body.status ?? "Active", plan: body.plan ?? "Full-time", balance: body.balance ?? 0 })
      .select().single()
    if (error) throw new Error(error.message)
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
