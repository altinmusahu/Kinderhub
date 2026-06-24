import { NextResponse } from "next/server"
import { createTenantSchema } from "../modules/tenants/tenant.validation"
import { supabaseAdmin } from "@/utils/supabase/admin"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createTenantSchema.parse(body)

    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabaseAdmin
      .from("tenants")
      .insert([{ Name: parsed.Name, Slug: parsed.Slug, CreatedAt: today }])
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Something went wrong" },
      { status: 400 }
    )
  }
}
