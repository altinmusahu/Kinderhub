import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { UserService } from "@/app/api/modules/user/user.service"
import { UserProfilesRepository } from "@/app/api/modules/user_profiles/user_profiles.repository"
import { UserProfilesService } from "@/app/api/modules/user_profiles/user_profiles.service"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    await UserService.getById(id, tenant_id)

    const profile = await UserProfilesService.getByUser(id)
    if (!profile) return NextResponse.json(null)

    return NextResponse.json({ ...profile, file_url: UserProfilesRepository.getPublicUrl(profile.file_url) })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401
      : error instanceof Error && error.message === "User not found" ? 404 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    await UserService.getById(id, tenant_id)

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const profile = await UserProfilesService.upload({ file, user_id: id })
    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401
      : error instanceof Error && error.message === "User not found" ? 404 : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    await UserService.getById(id, tenant_id)

    await UserProfilesService.remove(id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401
      : error instanceof Error && error.message === "User not found" ? 404 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
