import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { KidsService } from "@/app/api/modules/kids/kids.service"

type Params = { params: Promise<{ class_id: string; kid_id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { kid_id } = await params
    const parents = await KidsService.getFamilyParents(kid_id, tenant_id)
    return NextResponse.json(parents)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
