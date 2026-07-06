import { z } from "zod"

export const createClassEventSchema = z.object({
  class_id: z.string().min(1, "Class is required"),
  tenant_id: z.string().min(1, "Tenant is required"),
  title: z.string().min(1, "Title is required"),
  location: z.string().nullable().optional().default(null),
  starts_at: z.string().min(1, "Start date/time is required"),
  ends_at: z.string().nullable().optional().default(null),
})

export type CreateClassEventInput = z.infer<typeof createClassEventSchema>
