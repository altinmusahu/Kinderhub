import { z } from "zod"

export const upsertClassMenuCellSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  meal_type: z.enum(["breakfast", "snack", "lunch"]),
  description: z.string().min(1, "Description is required"),
})

export type UpsertClassMenuCellInput = z.infer<typeof upsertClassMenuCellSchema>

export const copyClassMenuWeekSchema = z.object({
  source_class_id: z.string().uuid(),
  week: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Week must be YYYY-MM-DD"),
})

export type CopyClassMenuWeekInput = z.infer<typeof copyClassMenuWeekSchema>
