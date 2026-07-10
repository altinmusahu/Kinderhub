import { supabaseAdmin } from "@/lib/supabase-admin"
import { ActivitiesService } from "@/app/api/modules/activities/activities.service"
import type { SessionPayload } from "@/lib/auth"

export type ActivityAction =
  | "added"
  | "updated"
  | "deleted"
  | "generated"
  | "exported"

export type ActivityEntity =
  | "Staff"
  | "Department"
  | "Location"
  | "Family"
  | "Parent"
  | "Child"
  | "Class"
  | "Work tracking record"
  | "Contract"
  | "ContractTemplate"
  | "Legal info"
  | "Document"
  | "Salary"

function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0")
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  const y = date.getFullYear()
  return `${d}/${m}/${y}`
}

export async function logActivity(
  session: SessionPayload,
  action: ActivityAction,
  entity: ActivityEntity,
  entityName?: string
): Promise<void> {
  try {
    // Resolve the executor's full name from the users table
    const { data } = await supabaseAdmin
      .from("users")
      .select("name, lastname")
      .eq("id", session.sub)
      .single()

    const fullName = data ? `${data.name} ${data.lastname}` : session.email
    const date = formatDate(new Date())
    const subject = entityName ? `${entity} "${entityName}"` : entity
    const activity = `${subject} was ${action} by ${fullName} on ${date}`

    await ActivitiesService.create({
      executor_id: session.sub,
      activity,
      tenant_id: session.tenant_id,
    })
  } catch {
    // Activity logging must never crash the main request
  }
}
