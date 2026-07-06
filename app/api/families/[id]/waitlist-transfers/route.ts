import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { WaitlistService } from "@/app/api/modules/waitlist/waitlist.service"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const transfers = await WaitlistService.getClassTransfersForFamily(tenant_id, id)
    return NextResponse.json(transfers)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
