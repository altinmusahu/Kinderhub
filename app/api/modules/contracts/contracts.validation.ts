import { z } from "zod"

export const createContractSchema = z.object({
  family_id:   z.string().uuid("Invalid family"),
  kid_id:      z.string().uuid("Invalid kid"),
  template_id: z.string().uuid("Invalid template"),
  valid_from:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "valid_from must be YYYY-MM-DD"),
  valid_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "valid_until must be YYYY-MM-DD"),
})

export const updateContractSchema = z.object({
  status: z.enum(["Pending Signature", "Signed", "Cancelled"]).optional(),
})

export type CreateContractInput = z.infer<typeof createContractSchema>
export type UpdateContractInput = z.infer<typeof updateContractSchema>
