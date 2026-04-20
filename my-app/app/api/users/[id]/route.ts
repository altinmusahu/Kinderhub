import { NextRequest, NextResponse } from "next/server"
import { UserService } from "@/app/api/modules/user/user.service"
import { updateUserSchema } from "@/app/api/modules/user/user.validation"
import { ZodError } from "zod"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await UserService.getById(id)
    return NextResponse.json(user)
} catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = updateUserSchema.parse(await request.json())
    const user = await UserService.update(id, body)
    return NextResponse.json(user)
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    await UserService.delete(id)
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
