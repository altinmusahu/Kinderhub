import { z } from "zod"

export const createParentsSchema = z.object({
  family_id:       z.string().min(1, "Family is required"),
  firstname:       z.string().min(1, "Firstname is required"),
  lastname:        z.string().min(1, "Lastname is required"),
  date_of_birth:   z.string().date(),
  personal_number: z.string().min(1, "Personal number is required"),
  is_active:       z.boolean().default(true),
  phone_number:    z.string().min(1, "Phone number is required"),
  address:         z.string().default(""),
  pick_up:         z.boolean().default(false),
  tenant_id:       z.string().min(1, "Tenant is required"),
})

export const updateParentsSchema = createParentsSchema.partial()

export type CreateParentInput = z.infer<typeof createParentsSchema>
export type UpdateParentInput = z.infer<typeof updateParentsSchema>
