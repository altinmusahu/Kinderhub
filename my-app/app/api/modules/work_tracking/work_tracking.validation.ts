import { z } from "zod"

export const createWorkTrackingSchema = z.object({
  tenant_id: z.string().uuid("Invalid tenant ID"),
  department_id: z.string().uuid("Invalid department ID").nullable().optional().default(null),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().nullable().optional().default(null),
  responsible_user_id: z.string().uuid("Invalid user ID").nullable().optional().default(null),
  user_id: z.string().uuid("Invalid user ID"),
  position_name: z.string().nullable().optional().default(null)
})

export const updateWorkTrackingSchema = z.object({
  department_id: z.string().uuid().nullable().optional(),
  start_date: z.string().min(1).optional(),
  end_date: z.string().nullable().optional(),
  responsible_user_id: z.string().uuid().nullable().optional(),
  position_name: z.string().nullable().optional()
})

export type CreateWorkTrackingInput = z.infer<typeof createWorkTrackingSchema>
export type UpdateWorkTrackingInput = z.infer<typeof updateWorkTrackingSchema>
