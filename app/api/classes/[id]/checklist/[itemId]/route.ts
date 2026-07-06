import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { getTenant } from "@/lib/get-tenant"
import { ClassChecklistItemsService } from "@/app/api/modules/class_checklist_items/class_checklist_items.service"
import { updateClassChecklistItemSchema } from "@/app/api/modules/class_checklist_items/class_checklist_items.validation"

type Params = { params: Promise<{ id: string; itemId: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { itemId } = await params
    const body = await req.json()
    const parsed = updateClassChecklistItemSchema.parse(body)
    const item = await ClassChecklistItemsService.update(itemId, tenant_id, parsed)
    return NextResponse.json(item)
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 })
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { tenant_id } = await getTenant()
    const { itemId } = await params
    await ClassChecklistItemsService.delete(itemId, tenant_id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status })
  }
}
