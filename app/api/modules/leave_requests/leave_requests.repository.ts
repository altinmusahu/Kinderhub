import { supabaseAdmin } from "@/lib/supabase-admin"
import type { CreateLeaveRequestDto, LeaveBalance, LeaveRequest, LeaveRequestWithUser, LeaveStatus, ReviewLeaveRequestDto } from "./leave_requests.types"
import { DEFAULT_ANNUAL_ENTITLEMENT_DAYS } from "./leave_requests.types"

function mapWithUser(row: Record<string, unknown>): LeaveRequestWithUser {
  const user = row.user as { name: string; lastname: string } | null
  const reviewer = row.reviewer as { name: string; lastname: string } | null
  const { user: _u, reviewer: _r, ...rest } = row
  return {
    ...(rest as LeaveRequest),
    user_name: user?.name ?? "",
    user_lastname: user?.lastname ?? "",
    reviewer_name: reviewer?.name ?? null,
    reviewer_lastname: reviewer?.lastname ?? null,
  }
}

export const LeaveRequestsRepository = {
  async findByUser(userId: string): Promise<LeaveRequestWithUser[]> {
    const { data, error } = await supabaseAdmin
      .from("leave_requests")
      .select(`
        *,
        user:user_id ( name, lastname ),
        reviewer:reviewed_by ( name, lastname )
      `)
      .eq("user_id", userId)
      .order("start_date", { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(mapWithUser)
  },

  async findAllByTenant(tenantId: string): Promise<LeaveRequestWithUser[]> {
    const { data, error } = await supabaseAdmin
      .from("leave_requests")
      .select(`
        *,
        user:user_id ( name, lastname ),
        reviewer:reviewed_by ( name, lastname )
      `)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(mapWithUser)
  },

  async findById(id: string): Promise<LeaveRequest | null> {
    const { data, error } = await supabaseAdmin
      .from("leave_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const { data, error } = await supabaseAdmin
      .from("leave_requests")
      .insert([{ ...payload, status: "pending" as LeaveStatus }])
      .select("*")
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async review(id: string, payload: ReviewLeaveRequestDto): Promise<LeaveRequest> {
    const { data, error } = await supabaseAdmin
      .from("leave_requests")
      .update({
        status: payload.status,
        reviewed_by: payload.reviewed_by,
        review_note: payload.review_note,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async cancel(id: string, userId: string): Promise<LeaveRequest> {
    const { data, error } = await supabaseAdmin
      .from("leave_requests")
      .update({ status: "cancelled" as LeaveStatus })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single()
    if (error) throw new Error(error.message)
    return data
  },
}

export const LeaveBalancesRepository = {
  async findOne(userId: string, year: number, leaveType: string): Promise<LeaveBalance | null> {
    const { data, error } = await supabaseAdmin
      .from("leave_balances")
      .select("*")
      .eq("user_id", userId)
      .eq("year", year)
      .eq("leave_type", leaveType)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async create(tenantId: string, userId: string, year: number, entitledDays: number): Promise<LeaveBalance> {
    const { data, error } = await supabaseAdmin
      .from("leave_balances")
      .insert([{
        tenant_id: tenantId,
        user_id: userId,
        year,
        leave_type: "annual",
        entitled_days: entitledDays,
        carried_over: 0,
      }])
      .select("*")
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  // Get the employee's annual-leave balance row for a year, creating a default one
  // if it doesn't exist yet — balances aren't set up per-employee anywhere else.
  async getOrCreateAnnual(tenantId: string, userId: string, year: number): Promise<LeaveBalance> {
    const existing = await LeaveBalancesRepository.findOne(userId, year, "annual")
    if (existing) return existing

    const { data, error } = await supabaseAdmin
      .from("leave_balances")
      .insert([{
        tenant_id: tenantId,
        user_id: userId,
        year,
        leave_type: "annual",
        entitled_days: DEFAULT_ANNUAL_ENTITLEMENT_DAYS,
        carried_over: 0,
      }])
      .select("*")
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async updateAnnual(tenantId: string, userId: string, year: number, payload: { entitled_days: number; carried_over: number }): Promise<LeaveBalance> {
    // Ensure a row exists first (upsert-by-hand) so editing works even before any
    // read has happened yet — updateAnnual can be the very first balance operation.
    await LeaveBalancesRepository.getOrCreateAnnual(tenantId, userId, year)

    const { data, error } = await supabaseAdmin
      .from("leave_balances")
      .update(payload)
      .eq("user_id", userId)
      .eq("year", year)
      .eq("leave_type", "annual")
      .select("*")
      .single()
    if (error) throw new Error(error.message)
    return data
  },
}
