import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { loginSchema } from "@/app/api/modules/user/user.validation"
import { UserRepository } from "@/app/api/modules/user/user.repository"
import { signToken, cookieName, cookieOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const body = loginSchema.parse(await req.json())

    const user = await UserRepository.findByEmail(body.email)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(body.password, user.password_hash)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = await signToken({
      sub: user.id,
      email: user.email,
      tenant_id: user.tenant_id,
      role: user.role,
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        is_first_login_executed: user.is_first_login_executed,
      },
    })

    response.cookies.set(cookieName(), token, cookieOptions())
    return response
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 400 }
    )
  }
}
