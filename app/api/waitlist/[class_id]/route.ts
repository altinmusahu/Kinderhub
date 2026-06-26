import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { WaitlistService } from "@/app/api/modules/waitlist/waitlist.service"

type Params = { params: Promise<{ class_id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { class_id } = await params
    const entries = await WaitlistService.getByClassId(tenant_id, class_id)
    return NextResponse.json(entries)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { class_id } = await params
    const body = await req.json()
    const entry = await WaitlistService.create({
      class_id,
      tenant_id,
      firstname:     body.firstname,
      lastname:      body.lastname,
      date_of_birth: body.date_of_birth,
      note:          body.note ?? null,
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status })
  }
}
