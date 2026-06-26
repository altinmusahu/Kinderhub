import { z } from "zod"

export const createClassSchema = z.object({
  name:               z.string().min(1, "Name is required"),
  average_year:       z.string().min(1, "Age range is required"),
  location_id:        z.string().uuid("Invalid location"),
  starts_at:          z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  ends_at:            z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  capacity:           z.number().int().positive("Capacity must be a positive number"),
  lead_user_id:       z.string().uuid("Invalid lead user"),
  assistant_user_id:  z.string().uuid("Invalid assistant user").nullable().optional(),
  schedule:           z.record(z.string(), z.unknown()).nullable().optional(),
})

export const updateClassSchema = createClassSchema.partial()

export type CreateClassInput = z.infer<typeof createClassSchema>
export type UpdateClassInput = z.infer<typeof updateClassSchema>
