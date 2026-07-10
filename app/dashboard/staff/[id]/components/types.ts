import type { UserById } from "@/app/api/modules/user/user.types"

export type { UserById }

export type ClassRow = {
  id: string
  name: string
  average_year: string
  starts_at: string
  ends_at: string
  capacity: number
  locations: { name: string } | null
}

export type DocRow = {
  id: string
  file_url: string
  storage_path: string
  created_at: string
}

export type WorkTrackingRow = {
  id: string
  position_name: string | null
  start_date: string | null
  end_date: string | null
  department_id: string | null
  responsible_user_id: string | null
  department: { name: string } | null
}

export type SalaryRow = {
  id: string
  user_id: string
  date: string
  salary: number
  is_active: boolean
}
