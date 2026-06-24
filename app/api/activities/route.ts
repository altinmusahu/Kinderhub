import { NextResponse } from "next/server"
import { ActivitiesService } from "@/app/api/modules/activities/activities.service"
import { getTenant } from "@/lib/get-tenant"

export async function GET() {
  try {
    const { tenant_id } = await getTenant()
    const activities = await ActivitiesService.getAll(tenant_id)
    return NextResponse.json(activities)
  } catch (error) {
    const status = error instanceof Error && error.message === "Unauthorized" ? 401 : 500
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch activities" },
      { status }
    )
  }
}
