export type User = {
  id: string
  name: string
  lastname: string
  phone_number: string
  personal_number: string
  role: string
  created_at: string
  is_active: boolean
  date_of_birth: string
  tenant_id: string
  email: string
  password_hash: string
  is_first_login_executed: boolean
}

export type CreateUserDto = Omit<User, "id">

export type UpdateUserDto = Partial<Omit<User, "id" | "tenant_id" | "created_at">>
