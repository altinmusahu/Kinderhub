import { z } from "zod"

export const upsertKidAttendanceSchema = z.object({
  kid_id: z.string().min(1, "Child is required"),
  action: z.enum(["check_in", "check_out", "absent"]),
  check_out_to: z.string().nullable().optional().default(null),
  back_up_check_out_to: z.string().nullable().optional().default(null),
  pickup_note: z.string().nullable().optional().default(null),
  absent_reason: z.string().nullable().optional().default(null),
})

export type UpsertKidAttendanceInput = z.infer<typeof upsertKidAttendanceSchema>
