import { NextRequest, NextResponse } from "next/server"
import { UserService } from "@/app/api/modules/user/user.service"
import { createUserSchema } from "@/app/api/modules/user/user.validation"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { can } from "@/lib/permissions/can"

export async function GET() {
  try {
    const { tenant_id } = await getTenant()
    const users = await UserService.getAll(tenant_id)
    return NextResponse.json(users)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch users" }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getTenant()

    const allowed = await can(session, "staff", "full")
    if (!allowed) return NextResponse.json({ message: "You don't have permission to add staff" }, { status: 403 })

    const body = await req.json()
    const parsed = createUserSchema.parse(body)
    const user = await UserService.create(parsed)
    logActivity(session, "added", "Staff", `${parsed.name} ${parsed.lastname}`)
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 400
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Something went wrong" },
      { status }
    )
  }
}
