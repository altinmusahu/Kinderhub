import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { ContractsService } from "@/app/api/modules/contracts/contracts.service"

type Params = { params: Promise<{ id: string }> }

// Returns a 7-day signed URL for the contract PDF stored in the "contracts" bucket
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const url = await ContractsService.getSignedPdfUrl(id, tenant_id)
    return NextResponse.json({ url })
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401
      : e instanceof Error && e.message === "Contract not found" ? 404 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
