import { z } from "zod"

export const createSalaryTrackingSchema = z.object({
  date: z.string().min(1, "Date is required"),
  salary: z.coerce.number().positive("Salary must be greater than 0"),
  currency_id: z.string().min(1, "Currency is required"),
})

export type CreateSalaryTrackingInput = z.infer<typeof createSalaryTrackingSchema>
