import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { getTenant } from "@/lib/get-tenant"
import { ClassHubPostsService } from "@/app/api/modules/class_hub_posts/class_hub_posts.service"
import { updateClassHubPostSchema } from "@/app/api/modules/class_hub_posts/class_hub_posts.validation"

type Params = { params: Promise<{ id: string; postId: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { postId } = await params
    const body = await req.json()
    const parsed = updateClassHubPostSchema.parse(body)
    const post = await ClassHubPostsService.update(postId, session.tenant_id, session.sub, parsed)
    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 })
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // Supabase throws "JSON object requested, multiple (or no) rows returned" when the
    // id/tenant/author combination doesn't match a row — i.e. not this user's post.
    return NextResponse.json({ error: "You can only edit your own posts" }, { status: 403 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { postId } = await params
    await ClassHubPostsService.delete(postId, session.tenant_id, session.sub)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "You can only delete your own posts" }, { status: 403 })
  }
}
