import { z } from "zod"

export const createLeaveRequestSchema = z.object({
  leave_type: z.enum(["annual", "sick", "unpaid", "maternity", "paternity", "bereavement", "personal"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  reason: z.string().trim().max(500).optional(),
}).refine((v) => new Date(v.end_date) >= new Date(v.start_date), {
  message: "End date must be on or after the start date",
  path: ["end_date"],
})

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>

export const reviewLeaveRequestSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  review_note: z.string().trim().max(500).optional(),
})

export type ReviewLeaveRequestInput = z.infer<typeof reviewLeaveRequestSchema>

export const setLeaveBalanceSchema = z.object({
  entitled_days: z.coerce.number().min(0, "Entitled days can't be negative"),
  carried_over: z.coerce.number().min(0, "Carried over days can't be negative"),
})

export type SetLeaveBalanceInput = z.infer<typeof setLeaveBalanceSchema>
