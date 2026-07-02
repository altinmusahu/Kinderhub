import { z } from "zod"

export const createDocumentSchema = z.object({
  file_url: z.string().min(1, "File is required"),
  kid_id: z.string().nullable().optional().default(null),
  user_id: z.string().nullable().optional().default(null),
  family_id: z.string().nullable().optional().default(null),
})

export const updateDocumentSchema = createDocumentSchema.partial()

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>