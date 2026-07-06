export type AttendanceStatus = "pending" | "in" | "late" | "out" | "absent"

export type KidAttendance = {
  id: string
  kid_id: string
  class_id: string
  date: string
  check_in: string | null
  check_out: string | null
  checked_in_by: string | null
  checked_out_by: string | null
  check_out_to: string | null
  back_up_check_out_to: string | null
  pickup_note: string | null
  status: AttendanceStatus | null
  absent_reason: string | null
  tenant_id: string
  created_at: string
}

export type KidAttendanceWithDetails = KidAttendance & {
  kid_name: string | null
  checked_in_by_name: string | null
  checked_out_by_name: string | null
  check_out_to_name: string | null
}

export type UpsertKidAttendanceDto = {
  kid_id: string
  class_id: string
  date: string
  tenant_id: string
  action: "check_in" | "check_out" | "absent"
  performed_by: string
  check_out_to?: string | null
  back_up_check_out_to?: string | null
  pickup_note?: string | null
  absent_reason?: string | null
}

export type AttendanceFilters = {
  dateFrom?: string
  dateTo?: string
  search?: string
  checkedOutBy?: string
  releasedTo?: string
  status?: string
  page: number
  pageSize: number
}

export type AttendanceStats = {
  presentRate30d: number
  lateToday: number
  absentToday: number
}
