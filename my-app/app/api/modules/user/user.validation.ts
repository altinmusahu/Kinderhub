import { z } from "zod"

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email"),
  phone_number: z.string().min(1, "Phone number is required"),
  personal_number: z.string().min(1, "Personal number is required"),
  role: z.string().min(1, "Role is required"),
  is_active: z.boolean(),
  date_of_birth: z.string().min(1, "Date of birth is required"),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  lastname: z.string().min(1).optional(),
  email: z.email().optional(),
  phone_number: z.string().min(1).optional(),
  personal_number: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
  date_of_birth: z.string().min(1).optional(),
  is_first_login_executed: z.boolean().optional(),
})

export const changePasswordSchema = z.object({
  new_password: z.string().min(6, "Password must be at least 6 characters"),
})

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type LoginInput = z.infer<typeof loginSchema>
