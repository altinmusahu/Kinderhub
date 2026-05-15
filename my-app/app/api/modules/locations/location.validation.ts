import { z } from "zod"

export const createLocationSchema = z.object({
  tenant_id: z.string().min(1, "tenant is required"),
  name: z.string().min(1, "Name is required"),
  street: z.string().min(1, "Street is required"),
  house_number: z.string().nullable().optional().default(null),
  postal_code: z.string().nullable().optional().default(null),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required")
})

export const updateLocationSchema = createLocationSchema.partial()

export type CreateLocationInput = z.infer<typeof createLocationSchema>
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>
