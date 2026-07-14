import { NextRequest, NextResponse } from "next/server"
import { UserService } from "@/app/api/modules/user/user.service"
import { updateUserSchema } from "@/app/api/modules/user/user.validation"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { can } from "@/lib/permissions/can"
import { ZodError } from "zod"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const user = await UserService.getById(id, tenant_id)
    return NextResponse.json(user)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 404
    return NextResponse.json({ error: error instanceof Error ? error.message : "Not found" }, { status })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params
    const body = updateUserSchema.parse(await request.json())

    if (body.role_id !== undefined) {
      const allowed = await can(session, "settings", "full")
      if (!allowed) return NextResponse.json({ error: "You don't have permission to change this staff member's role" }, { status: 403 })
    }

    const user = await UserService.update(id, session.tenant_id, body)
    logActivity(session, "updated", "Staff", `${user.name} ${user.lastname}`)
    return NextResponse.json(user)
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    const status = err instanceof Error && err.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to update user" }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    await UserService.delete(id, tenant_id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to delete user" }, { status })
  }
}
