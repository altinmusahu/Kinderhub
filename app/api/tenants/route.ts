import { NextResponse } from "next/server"
import { createTenantSchema } from "../modules/tenants/tenant.validation"
import { TenantService } from "../modules/tenants/tenant.service"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createTenantSchema.parse(body)

    const tenant = await TenantService.create(parsed)

    return NextResponse.json(tenant, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Something went wrong" },
      { status: 400 }
    )
  }
}
