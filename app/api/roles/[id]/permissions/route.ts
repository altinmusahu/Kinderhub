import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { RolesService } from "@/app/api/modules/roles/roles.service"
import { upsertPermissionsSchema } from "@/app/api/modules/roles/roles.validation"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "settings", "full")
    if (!allowed) return NextResponse.json({ error: "You don't have permission to edit role permissions" }, { status: 403 })

    const permissions = upsertPermissionsSchema.parse(await req.json())
    const role = await RolesService.upsertPermissions(id, session.tenant_id, permissions)
    logActivity(session, "updated", "Role", `${role.name} permissions`)
    return NextResponse.json(role)
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = error instanceof Error && error.message === "Unauthorized" ? 401
      : error instanceof Error && error.message === "The Owner role's permissions can't be modified" ? 403
      : error instanceof Error && error.message === "Role not found" ? 404 : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status })
  }
}
