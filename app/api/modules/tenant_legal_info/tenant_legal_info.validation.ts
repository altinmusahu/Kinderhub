import { z } from "zod"

export const createTenantLegalInfoSchema = z.object({
  legal_entity_name:   z.string().min(1, "Legal entity name is required"),
  country:             z.string().min(1, "Country is required"),
  tax_id:              z.string().min(1, "Tax ID is required"),
  registration_number: z.string().min(1, "Registration number is required"),
  street:              z.string().min(1, "Street is required"),
  city:                z.string().min(1, "City is required"),
  postal_code:         z.string().min(1, "Postal code is required"),
  rep_name:            z.string().min(1, "Representative name is required"),
  rep_title:           z.string().min(1, "Representative title is required"),
  rep_email:           z.string().email("Invalid email"),
  rep_phone:           z.string().min(1, "Representative phone is required"),
})

export const updateTenantLegalInfoSchema = createTenantLegalInfoSchema.partial()

export type CreateTenantLegalInfoInput = z.infer<typeof createTenantLegalInfoSchema>
export type UpdateTenantLegalInfoInput = z.infer<typeof updateTenantLegalInfoSchema>
