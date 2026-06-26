import { z } from "zod"

export const createContractTemplateSchema = z.object({
  name:       z.string().min(1, "Name is required"),
  type:       z.string().min(1, "Type is required"),
  body:       z.string().min(1, "Body is required"),
  is_default: z.boolean().default(false),
  is_active:  z.boolean().default(true),
})

export const updateContractTemplateSchema = createContractTemplateSchema.partial()

export type CreateContractTemplateInput = z.infer<typeof createContractTemplateSchema>
export type UpdateContractTemplateInput = z.infer<typeof updateContractTemplateSchema>
