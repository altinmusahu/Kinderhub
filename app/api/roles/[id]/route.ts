import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { RolesService } from "@/app/api/modules/roles/roles.service"
import { updateRoleSchema } from "@/app/api/modules/roles/roles.validation"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const role = await RolesService.getById(id, tenant_id)
    return NextResponse.json(role)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 404
    return NextResponse.json({ error: error instanceof Error ? error.message : "Not found" }, { status })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "settings", "full")
    if (!allowed) return NextResponse.json({ error: "You don't have permission to edit roles" }, { status: 403 })

    const body = updateRoleSchema.parse(await req.json())
    const role = await RolesService.update(id, session.tenant_id, body)
    logActivity(session, "updated", "Role", role.name)
    return NextResponse.json(role)
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = error instanceof Error && error.message === "Unauthorized" ? 401
      : error instanceof Error && error.message === "The Owner role can't be modified" ? 403 : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "settings", "full")
    if (!allowed) return NextResponse.json({ error: "You don't have permission to delete roles" }, { status: 403 })

    const role = await RolesService.getById(id, session.tenant_id)
    await RolesService.delete(id, session.tenant_id)
    logActivity(session, "deleted", "Role", role.name)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401
      : error instanceof Error && /Owner role|System roles/.test(error.message) ? 403
      : error instanceof Error && error.message === "Role not found" ? 404 : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status })
  }
}
