import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { SearchService } from "@/app/api/modules/search/search.service"

export async function GET(req: NextRequest) {
  try {
    const { tenant_id } = await getTenant()
    const q = req.nextUrl.searchParams.get("q") ?? ""
    const results = await SearchService.search(tenant_id, q)
    return NextResponse.json(results)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
