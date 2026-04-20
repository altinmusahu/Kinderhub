import { z } from "zod"

export const createUserSchema = z.object({
  Name: z.string().min(1, "Name is required"),
  Lastname: z.string().min(1, "Last name is required"),
  PhoneNumber: z.string().min(1, "Phone number is required"),
  PersonalNumber: z.string().min(1, "Personal number is required"),
  Role: z.enum(["Admin", "User"]),
  IsActive: z.boolean(),
  DateOfBirth: z.string().min(1, "Date of birth is required"),
})

export const updateUserSchema = createUserSchema.partial()

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
