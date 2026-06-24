import { z } from "zod"

export const createKidsSchema = z.object({
    family_id: z.string().min(1, "Family is required"),
    firstname: z.string().min(1, "Firstname is required"),
    lastname: z.string().min(1, "Lastname is required"),
    date_of_birth: z.string().date(),
    personal_number: z.string().nullable().optional(),
    gender: z.string().min(1, "Gender is required"),
    class_id: z.string().nullable().optional(),
    tenant_id: z.string().min(1, "Tenant is required")
})

export const updateKidsSchema = createKidsSchema.partial()

export type CreateKidsInput = z.infer<typeof createKidsSchema>
export type UpdateKidsInput = z.infer<typeof updateKidsSchema>