import { getTenant } from "@/lib/get-tenant"
import { NextRequest, NextResponse } from "next/server"
import { KidsService } from "../../modules/kids/kids.service"

type Params = { params: Promise<{ class_id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { class_id } = await params
    const department = await KidsService.getKidsByClassId(tenant_id, class_id)
    return NextResponse.json(department)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 404
    return NextResponse.json({ error: error instanceof Error ? error.message : "Not found" }, { status })
  }
}