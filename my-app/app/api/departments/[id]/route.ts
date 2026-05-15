import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { DepartmentService } from "../../modules/departments/department.service"
import { updateDepartmentSchema } from "../../modules/departments/department.validation"
import { getTenant } from "@/lib/get-tenant"

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
    const { tenant_id } = await getTenant()
    const { id } = await params
    const body = updateDepartmentSchema.parse(await request.json())
    const department = await DepartmentService.update(id, tenant_id, body)
    return NextResponse.json(department)
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    const status = err instanceof Error && err.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to update department" }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    await DepartmentService.delete(id, tenant_id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: "Failed to delete department" }, { status })
  }
}
