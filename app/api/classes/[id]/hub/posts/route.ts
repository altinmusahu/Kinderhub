import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { getTenant } from "@/lib/get-tenant"
import { ClassHubPostsService } from "@/app/api/modules/class_hub_posts/class_hub_posts.service"
import { createClassHubPostSchema } from "@/app/api/modules/class_hub_posts/class_hub_posts.validation"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const posts = await ClassHubPostsService.getByClassId(tenant_id, id)
    return NextResponse.json(posts)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { id } = await params

    const allowed = await can(session, "hub", "edit", id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to post to this class's hub" }, { status: 403 })

    const body = await req.json()
    const parsed = createClassHubPostSchema.parse({
      ...body,
      class_id: id,
      tenant_id: session.tenant_id,
      author_id: session.sub,
    })
    const post = await ClassHubPostsService.create(parsed)
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
