import { SalaryTracking } from "../salary_tracking/salary_tracking.types"
import { Address } from "../address/address.types"

export type User = {
  id: string
  name: string
  lastname: string
  phone_number: string
  personal_number: string
  role: string
  role_id: string | null
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
  salary: SalaryTracking | null
  address: Address | null
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
  profile_picture_url: string | null
  salary: number | null
  salary_symbol: string | null
}

export type CreateUserDto = Omit<User, "id">

export type UpdateUserDto = Partial<Omit<User, "id" | "tenant_id" | "created_at">>