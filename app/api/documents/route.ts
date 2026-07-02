import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { DocumentsService } from "../modules/documents/documents.service"

export async function GET() {
  try {
    const { tenant_id } = await getTenant()
    const documents = await DocumentsService.getAllForTenant(tenant_id)
    return NextResponse.json(documents)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch documents" }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getTenant()

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ message: "File is required" }, { status: 400 })

    const document = await DocumentsService.upload({
      file,
      kid_id: (formData.get("kid_id") as string | null) || null,
      user_id: (formData.get("user_id") as string | null) || null,
      family_id: (formData.get("family_id") as string | null) || null,
    })

    logActivity(session, "added", "Document", file.name)

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 400
    return NextResponse.json({ message: error instanceof Error ? error.message : "Something went wrong" }, { status })
  }
}
