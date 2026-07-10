import { z } from "zod"

export const createUserProfileSchema = z.object({
  file_url: z.string().min(1, "File is required"),
  user_id: z.string().min(1, "User is required"),
})

export type CreateUserProfileInput = z.infer<typeof createUserProfileSchema>
