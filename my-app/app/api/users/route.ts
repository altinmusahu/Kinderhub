import { NextResponse } from "next/server"
import { UserService } from "@/app/api/modules/user/user.service"
import { createUserSchema } from "@/app/api/modules/user/user.validation"

export async function GET() {
  try {
    const users = await UserService.getAll()
    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createUserSchema.parse(body)

    const user = await UserService.create(parsed)

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Something went wrong" },
      { status: 400 }
    )
  }
}