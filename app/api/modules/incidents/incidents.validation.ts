import { z } from "zod"

export const createIncidentSchema = z.object({
  kid_id: z.string().min(1, "Child is required"),
  reported_by: z.string().min(1, "Reporter is required"),
  tenant_id: z.string().min(1, "Tenant is required"),
  incident_type: z.string().min(1, "Incident type is required"),
  description: z.string().min(1, "Description is required"),
  action_taken: z.string().nullable().optional().default(null),
  parent_notified: z.boolean(),
  notified_at: z.string().min(1, "Notified-at date/time is required"),
  severity: z.enum(["Low", "Medium", "High"]),
})

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>
