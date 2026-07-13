import { NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { ClassesService } from "@/app/api/modules/classes/classes.service"

export async function GET() {
  try {
    await getTenant()
    const classes = await ClassesService.getAllLight()
    return NextResponse.json(classes)
  } catch (e) {
    const status = e instanceof Error && e.message === "Unauthorized" ? 401 : 500
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status })
  }
}
