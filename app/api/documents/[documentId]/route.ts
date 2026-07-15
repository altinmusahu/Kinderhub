import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { DocumentsService } from "@/app/api/modules/documents/documents.service"
import { can } from "@/lib/permissions/can"

type Params = { params: Promise<{ documentId: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getTenant()
    const { documentId } = await params

    const document = await DocumentsService.getById(documentId, session.tenant_id)
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 })

    const allowed = await can(session, "documents", "full", {
      kid_id: document.kid_id,
      user_id: document.user_id,
      family_id: document.family_id,
      class_id: document.class_id,
    })
    if (!allowed) return NextResponse.json({ error: "You don't have permission to delete this document" }, { status: 403 })

    await DocumentsService.delete(documentId, session.tenant_id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete document" }, { status })
  }
}
