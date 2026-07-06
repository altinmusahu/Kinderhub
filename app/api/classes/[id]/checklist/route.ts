import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { getTenant } from "@/lib/get-tenant"
import { ClassChecklistItemsService } from "@/app/api/modules/class_checklist_items/class_checklist_items.service"
import { createClassChecklistItemSchema } from "@/app/api/modules/class_checklist_items/class_checklist_items.validation"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const items = await ClassChecklistItemsService.getByClassId(tenant_id, id)
    return NextResponse.json(items)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { id } = await params
    const body = await req.json()
    const parsed = createClassChecklistItemSchema.parse({ ...body, class_id: id, tenant_id })
    const item = await ClassChecklistItemsService.create(parsed)
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
