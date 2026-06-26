import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { WaitlistService } from "@/app/api/modules/waitlist/waitlist.service"

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    await WaitlistService.delete(id, tenant_id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status })
  }
}
