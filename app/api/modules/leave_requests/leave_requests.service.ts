import { LeaveRequestsRepository, LeaveBalancesRepository } from "./leave_requests.repository"
import type { CreateLeaveRequestInput, ReviewLeaveRequestInput } from "./leave_requests.validation"
import type { LeaveRequest, LeaveRequestWithUser, LeaveSummary, TenantLeaveSummary } from "./leave_requests.types"

function weekdaysInclusive(start: string, end: string): number {
  let count = 0
  const cur = new Date(start)
  const last = new Date(end)
  while (cur <= last) {
    const day = cur.getDay()
    if (day !== 0 && day !== 6) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

function summarize(rows: LeaveRequestWithUser[], entitled: number, carriedOver: number): LeaveSummary {
  const thisYear = new Date().getFullYear()
  const inThisYear = (r: LeaveRequest) => new Date(r.start_date).getFullYear() === thisYear

  const used = rows
    .filter((r) => r.status === "approved" && inThisYear(r))
    .reduce((sum, r) => sum + Number(r.total_days), 0)

  const pending = rows
    .filter((r) => r.status === "pending" && inThisYear(r))
    .reduce((sum, r) => sum + Number(r.total_days), 0)

  const total = entitled + carriedOver
  return {
    entitled: total,
    carriedOver,
    used,
    pending,
    remaining: Math.max(0, total - used - pending),
  }
}

export const LeaveRequestsService = {
  async getByUser(userId: string): Promise<LeaveRequestWithUser[]> {
    return LeaveRequestsRepository.findByUser(userId)
  },

  async getSummaryForUser(tenantId: string, userId: string): Promise<LeaveSummary> {
    const year = new Date().getFullYear()
    const [rows, balance] = await Promise.all([
      LeaveRequestsRepository.findByUser(userId),
      LeaveBalancesRepository.getOrCreateAnnual(tenantId, userId, year),
    ])
    return summarize(rows, Number(balance.entitled_days), Number(balance.carried_over))
  },

  async setBalance(tenantId: string, userId: string, entitledDays: number, carriedOver: number): Promise<LeaveSummary> {
    const year = new Date().getFullYear()
    const [rows] = await Promise.all([
      LeaveRequestsRepository.findByUser(userId),
      LeaveBalancesRepository.updateAnnual(tenantId, userId, year, { entitled_days: entitledDays, carried_over: carriedOver }),
    ])
    return summarize(rows, entitledDays, carriedOver)
  },

  async getAllForTenant(tenantId: string): Promise<LeaveRequestWithUser[]> {
    return LeaveRequestsRepository.findAllByTenant(tenantId)
  },

  async getSummaryForTenant(tenantId: string): Promise<TenantLeaveSummary> {
    const rows = await LeaveRequestsRepository.findAllByTenant(tenantId)
    const now = new Date()
    const thisYear = now.getFullYear()
    const thisMonth = now.getMonth()
    const today = now.toISOString().slice(0, 10)

    return {
      pending: rows.filter((r) => r.status === "pending").length,
      approvedThisMonth: rows.filter((r) => {
        if (r.status !== "approved" || !r.reviewed_at) return false
        const d = new Date(r.reviewed_at)
        return d.getFullYear() === thisYear && d.getMonth() === thisMonth
      }).length,
      onLeaveToday: rows.filter((r) => r.status === "approved" && r.start_date <= today && r.end_date >= today).length,
      requestedThisYear: rows
        .filter((r) => new Date(r.created_at).getFullYear() === thisYear)
        .reduce((sum, r) => sum + Number(r.total_days), 0),
    }
  },

  async create(tenantId: string, userId: string, input: CreateLeaveRequestInput): Promise<LeaveRequest> {
    const total_days = weekdaysInclusive(input.start_date, input.end_date)
    return LeaveRequestsRepository.create({
      tenant_id: tenantId,
      user_id: userId,
      leave_type: input.leave_type,
      start_date: input.start_date,
      end_date: input.end_date,
      total_days,
      reason: input.reason?.trim() || null,
    })
  },

  async review(id: string, reviewerId: string, input: ReviewLeaveRequestInput): Promise<LeaveRequest> {
    const existing = await LeaveRequestsRepository.findById(id)
    if (!existing) throw new Error("Leave request not found")
    if (existing.status !== "pending") throw new Error("Only pending requests can be reviewed")

    return LeaveRequestsRepository.review(id, {
      status: input.status,
      reviewed_by: reviewerId,
      review_note: input.review_note?.trim() || null,
    })
  },

  async cancel(id: string, userId: string): Promise<LeaveRequest> {
    const existing = await LeaveRequestsRepository.findById(id)
    if (!existing) throw new Error("Leave request not found")
    if (existing.user_id !== userId) throw new Error("You can only cancel your own leave requests")
    if (existing.status !== "pending") throw new Error("Only pending requests can be cancelled")

    return LeaveRequestsRepository.cancel(id, userId)
  },
}
