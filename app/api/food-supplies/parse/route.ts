import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { parseReceiptImage } from "@/app/api/modules/food_supplies/food_supplies.parser"
import { can } from "@/lib/permissions/can"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

export async function POST(req: NextRequest) {
  try {
    const session = await getTenant()

    const allowed = await can(session, "food_supplies", "edit")
    if (!allowed) return NextResponse.json({ error: "You don't have permission to scan receipts" }, { status: 403 })

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No receipt photo provided" }, { status: 400 })
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "File must be a JPEG, PNG, or WEBP image" }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Receipt photo must be smaller than 10MB" }, { status: 400 })
    }

    const parsed = await parseReceiptImage(file)
    return NextResponse.json(parsed)
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 422
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to scan receipt" }, { status })
  }
}
