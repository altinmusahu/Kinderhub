import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { DepartmentService } from "../../modules/departments/department.service"
import { updateDepartmentSchema } from "../../modules/departments/department.validation"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const department = await DepartmentService.getById(id, tenant_id)
    return NextResponse.json(department)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 404
    return NextResponse.json({ error: error instanceof Error ? error.message : "Not found" }, { status })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "staff", "full")
    if (!allowed) return NextResponse.json({ error: "You don't have permission to edit departments" }, { status: 403 })

    const body = updateDepartmentSchema.parse(await request.json())
    const department = await DepartmentService.update(id, session.tenant_id, body)
    logActivity(session, "updated", "Department", department.name)
    return NextResponse.json(department)
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    const status = err instanceof Error && err.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to update department" }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "staff", "full")
    if (!allowed) return NextResponse.json({ error: "You don't have permission to delete departments" }, { status: 403 })

    await DepartmentService.delete(id, session.tenant_id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to delete department" }, { status })
  }
}
