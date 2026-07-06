import { z } from "zod"

export const createClassHubPostSchema = z.object({
  class_id: z.string().min(1, "Class is required"),
  tenant_id: z.string().min(1, "Tenant is required"),
  author_id: z.string().min(1, "Author is required"),
  post_type: z.enum(["Daily note", "Rule", "Issue", "Info"]),
  body: z.string().min(1, "Post text is required"),
})

export const updateClassHubPostSchema = z.object({
  body: z.string().min(1, "Post text is required"),
})

export type CreateClassHubPostInput = z.infer<typeof createClassHubPostSchema>
export type UpdateClassHubPostInput = z.infer<typeof updateClassHubPostSchema>
