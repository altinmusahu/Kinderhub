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

export type UserById = {
  user: Omit<User, "password_hash">
  position_name: string | null
  tenant_name: string | null
  department_name: string | null
  responsible_user_id: string | null
  responsible_user_name: string | null
  start_date: string | null
}

export type UserWithWorkTrackingAndDepartment = {
  id: string
  name: string
  lastname: string
  phone_number: string
  created_at: string
  is_active: boolean
  date_of_birth: string
  email: string
  department_id: string | null
  department_name: string | null
  position_name: string | null
}

export type CreateUserDto = Omit<User, "id">

export type UpdateUserDto = Partial<Omit<User, "id" | "tenant_id" | "created_at">>

// Using in frontend :
export type StaffRow = {
  id: string
  initials: string
  color: string
  name: string
  position_name: string | null
  dept: string
  status: string
  created_at: string
}