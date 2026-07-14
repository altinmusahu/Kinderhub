import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { logActivity } from "@/lib/log-activity"
import { ParentsRepository } from "@/app/api/modules/parents/parents.repository"
import { can } from "@/lib/permissions/can"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getTenant()

    const existing = await ParentsRepository.findById(id, session.tenant_id)
    if (!existing) return NextResponse.json({ error: "Parent not found" }, { status: 404 })

    const allowed = await can(session, "families", "edit", existing.family_id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to edit this parent" }, { status: 403 })

    const body = await req.json()

    const updated = await ParentsRepository.update(id, session.tenant_id, {
      firstname:       body.firstname,
      lastname:        body.lastname,
      phone_number:    body.phone_number    ?? "",
      personal_number: body.personal_number ?? "",
      date_of_birth:   body.date_of_birth,
      is_active:       body.is_active       ?? true,
      address:         body.address         ?? "",
      pick_up:         body.pick_up         ?? false,
    })

    logActivity(session, "updated", "Parent", `${body.firstname} ${body.lastname}`)
    return NextResponse.json(updated)
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getTenant()

    const existing = await ParentsRepository.findById(id, session.tenant_id)
    if (!existing) return NextResponse.json({ error: "Parent not found" }, { status: 404 })

    const allowed = await can(session, "families", "full", existing.family_id)
    if (!allowed) return NextResponse.json({ error: "You don't have permission to delete this parent" }, { status: 403 })

    await ParentsRepository.delete(id, session.tenant_id)
    return NextResponse.json({ success: true })
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
