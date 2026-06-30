import { NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { UserService } from "@/app/api/modules/user/user.service"

export async function GET() {
  try {
    const { tenant_id } = await getTenant()
    const users = await UserService.getUsersWithWorkTrackingAndDepartment(tenant_id)
    return NextResponse.json(users)
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status })
  }
}
