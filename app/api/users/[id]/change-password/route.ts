import { NextRequest, NextResponse } from "next/server"
import { changePasswordSchema } from "@/app/api/modules/user/user.validation"
import { UserService } from "@/app/api/modules/user/user.service"
import { getTenant } from "@/lib/get-tenant"
import { can } from "@/lib/permissions/can"
import { ZodError } from "zod"

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    if (id !== session.sub) {
      const allowed = await can(session, "staff", "full")
      if (!allowed) return NextResponse.json({ error: "You don't have permission to change this user's password" }, { status: 403 })
    }

    const { new_password } = changePasswordSchema.parse(await req.json())
    await UserService.changePassword(id, session.tenant_id, new_password)
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    const status = err instanceof Error && err.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status })
  }
}
