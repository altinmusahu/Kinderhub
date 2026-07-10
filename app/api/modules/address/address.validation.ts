import { z } from "zod"

export const createAddressSchema = z.object({
    street: z.string().optional().nullable().default(null),
    house_number: z.string().optional().nullable().default(null),
    city: z.string().optional().nullable().default(null),
    postal_code: z.string().optional().nullable().default(null),
    country: z.string().optional().nullable().default(null),
    user_id: z.string().optional().nullable().default(null),
})

export const updateAddressSchema = createAddressSchema.partial()

export type CreateAddressInput = z.infer<typeof createAddressSchema>
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>
