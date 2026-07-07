import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { supabaseAdmin } from "@/lib/supabase-admin"

type Params = { params: Promise<{ id: string }> }

// Signed URLs expire in 7 days (604800 seconds)
const SIGNED_URL_TTL = 60 * 60 * 24 * 7

// Extract storage path from a full Supabase URL, or return as-is if already a path
function toStoragePath(fileUrl: string): string {
  // If it's already a plain path (no http), return as-is
  if (!fileUrl.startsWith("http")) return fileUrl
  // Extract path after "/object/sign/documents/" or "/object/public/documents/"
  const match = fileUrl.match(/\/(?:sign|public)\/documents\/([^?]+)/)
  if (match) return match[1]
  // Fallback: extract after "/documents/"
  const fallback = fileUrl.match(/\/documents\/(.+?)(?:\?|$)/)
  return fallback ? fallback[1] : fileUrl
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await getTenant()
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("id, file_url, created_at")
      .eq("class_id", id)
      .is("kid_id", null)
      .is("user_id", null)
      .is("family_id", null)
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) return NextResponse.json([])

    // Generate fresh signed URLs for all documents in one batch call
    const paths = data.map((d) => toStoragePath(d.file_url))
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("documents")
      .createSignedUrls(paths, SIGNED_URL_TTL)

    if (signError) throw new Error(signError.message)

    const result = data.map((doc, i) => ({
      id: doc.id,
      file_url: signed?.[i]?.signedUrl ?? doc.file_url,
      storage_path: paths[i],
      created_at: doc.created_at,
    }))

    return NextResponse.json(result)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    await getTenant()
    const { id } = await params

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const storagePath = `${id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(storagePath, file, { contentType: file.type, upsert: false })

    if (uploadError) throw new Error(uploadError.message)

    // Store the storage path (not a URL) so we can always re-sign later
    const { data, error } = await supabaseAdmin
      .from("documents")
      .insert({ file_url: storagePath, user_id: null, kid_id: null, family_id: null, class_id: id })
      .select("id, file_url, created_at")
      .single()

    if (error) throw new Error(error.message)

    // Return a fresh signed URL immediately
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("documents")
      .createSignedUrl(storagePath, SIGNED_URL_TTL)

    if (signError) throw new Error(signError.message)

    return NextResponse.json(
      { id: data.id, file_url: signed.signedUrl, storage_path: storagePath, created_at: data.created_at },
      { status: 201 },
    )
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await getTenant()
    const { id } = await params
    const { documentId, storagePath } = await req.json()

    if (storagePath) {
      await supabaseAdmin.storage.from("documents").remove([storagePath])
    }

    const { error } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("id", documentId)
      .eq("class_id", id)

    if (error) throw new Error(error.message)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
