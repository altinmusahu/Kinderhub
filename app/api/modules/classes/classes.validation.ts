import { z } from "zod"

export const createClassSchema = z.object({
  name:               z.string().min(1, "Name is required"),
  average_year:       z.string().min(1, "Age range is required"),
  location_id:        z.string().uuid("Invalid location"),
  starts_at:          z.string().min(1, "Start time is required"),
  ends_at:            z.string().min(1, "End time is required"),
  capacity:           z.number().int().positive("Capacity must be a positive number"),
  lead_user_id:       z.string().uuid("Invalid lead user"),
  assistant_user_id:  z.string().uuid("Invalid assistant user").nullable().optional(),
  schedule:           z.record(z.string(), z.unknown()).nullable().optional(),
})

export const updateClassSchema = createClassSchema.partial()

export type CreateClassInput = z.infer<typeof createClassSchema>
export type UpdateClassInput = z.infer<typeof updateClassSchema>
