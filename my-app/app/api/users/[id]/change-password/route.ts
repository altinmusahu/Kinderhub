import { NextRequest, NextResponse } from "next/server"
import { changePasswordSchema } from "@/app/api/modules/user/user.validation"
import { UserService } from "@/app/api/modules/user/user.service"
import { getTenant } from "@/lib/get-tenant"
import { ZodError } from "zod"

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const { new_password } = changePasswordSchema.parse(await req.json())
    await UserService.changePassword(id, tenant_id, new_password)
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    const status = err instanceof Error && err.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status })
  }
}
