export type LeaveType = "annual" | "sick" | "unpaid" | "maternity" | "paternity" | "bereavement" | "personal"
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled"

export type LeaveRequest = {
  id: string
  tenant_id: string
  user_id: string
  leave_type: LeaveType
  start_date: string
  end_date: string
  total_days: number
  reason: string | null
  status: LeaveStatus
  reviewed_by: string | null
  reviewed_at: string | null
  review_note: string | null
  created_at: string
}

export type LeaveRequestWithUser = LeaveRequest & {
  user_name: string
  user_lastname: string
  reviewer_name: string | null
  reviewer_lastname: string | null
}

export type CreateLeaveRequestDto = {
  tenant_id: string
  user_id: string
  leave_type: LeaveType
  start_date: string
  end_date: string
  total_days: number
  reason: string | null
}

export type ReviewLeaveRequestDto = {
  status: "approved" | "rejected"
  reviewed_by: string
  review_note: string | null
}

export type LeaveBalance = {
  id: string
  tenant_id: string
  user_id: string
  year: number
  leave_type: LeaveType
  entitled_days: number
  carried_over: number
  created_at: string
}

// Default entitlement used to seed a leave_balances row the first time an
// employee's leave data is looked up for a given year, if one doesn't exist yet.
export const DEFAULT_ANNUAL_ENTITLEMENT_DAYS = 22

export type LeaveSummary = {
  entitled: number
  carriedOver: number
  used: number
  pending: number
  remaining: number
}

export type TenantLeaveSummary = {
  pending: number
  approvedThisMonth: number
  onLeaveToday: number
  requestedThisYear: number
}
