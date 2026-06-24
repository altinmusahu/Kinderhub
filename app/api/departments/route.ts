import { NextRequest, NextResponse } from "next/server"
import { DepartmentService } from "../modules/departments/department.service"
import { createDepartmentSchema } from "../modules/departments/department.validation"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"

export async function GET() {
  try {
    const { tenant_id } = await getTenant()
    const departments = await DepartmentService.getAll(tenant_id)
    return NextResponse.json(departments)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch departments" }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getTenant()
    const body = await req.json()
    const parsed = createDepartmentSchema.parse({ ...body, tenant_id: session.tenant_id })
    const department = await DepartmentService.create(parsed)
    logActivity(session, "added", "Department", department.name)
    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 400
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Something went wrong" },
      { status }
    )
  }
}
