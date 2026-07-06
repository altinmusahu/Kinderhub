import { supabaseAdmin } from "@/lib/supabase-admin"
import type {
  AttendanceFilters,
  AttendanceStats,
  KidAttendance,
  KidAttendanceWithDetails,
  UpsertKidAttendanceDto,
} from "./kid_attendance.types"

const SELECT_WITH_DETAILS = `
  *,
  kids ( firstname, lastname ),
  checked_in_user:users!kid_attendance_checked_in_by_fkey ( name, lastname ),
  checked_out_user:users!kid_attendance_checked_out_by_fkey ( name, lastname ),
  parents ( firstname, lastname )
`

type RawRow = {
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
  status: string | null
  absent_reason: string | null
  tenant_id: string
  created_at: string
  kids: { firstname: string; lastname: string }[] | { firstname: string; lastname: string } | null
  checked_in_user: { name: string; lastname: string }[] | { name: string; lastname: string } | null
  checked_out_user: { name: string; lastname: string }[] | { name: string; lastname: string } | null
  parents: { firstname: string; lastname: string }[] | { firstname: string; lastname: string } | null
}

function one<T>(v: T[] | T | null): T | null {
  if (Array.isArray(v)) return v[0] ?? null
  return v
}

function toDetails(row: RawRow): KidAttendanceWithDetails {
  const kid = one(row.kids)
  const inUser = one(row.checked_in_user)
  const outUser = one(row.checked_out_user)
  const parent = one(row.parents)
  return {
    id: row.id,
    kid_id: row.kid_id,
    class_id: row.class_id,
    date: row.date,
    check_in: row.check_in,
    check_out: row.check_out,
    checked_in_by: row.checked_in_by,
    checked_out_by: row.checked_out_by,
    check_out_to: row.check_out_to,
    back_up_check_out_to: row.back_up_check_out_to,
    pickup_note: row.pickup_note,
    status: row.status as KidAttendanceWithDetails["status"],
    absent_reason: row.absent_reason,
    tenant_id: row.tenant_id,
    created_at: row.created_at,
    kid_name: kid ? `${kid.firstname} ${kid.lastname}` : null,
    checked_in_by_name: inUser ? `${inUser.name} ${inUser.lastname}` : null,
    checked_out_by_name: outUser ? `${outUser.name} ${outUser.lastname}` : null,
    check_out_to_name: parent ? `${parent.firstname} ${parent.lastname}` : null,
  }
}

export const KidAttendanceRepository = {
  async findByClassAndDate(tenantId: string, classId: string, date: string): Promise<KidAttendanceWithDetails[]> {
    const { data, error } = await supabaseAdmin
      .from("kid_attendance")
      .select(SELECT_WITH_DETAILS)
      .eq("tenant_id", tenantId)
      .eq("class_id", classId)
      .eq("date", date)
    if (error) throw new Error(error.message)
    return ((data ?? []) as unknown as RawRow[]).map(toDetails)
  },

  async findOne(tenantId: string, kidId: string, date: string): Promise<KidAttendance | null> {
    const { data, error } = await supabaseAdmin
      .from("kid_attendance")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("kid_id", kidId)
      .eq("date", date)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data as KidAttendance | null
  },

  async upsertForKid(input: UpsertKidAttendanceDto): Promise<KidAttendanceWithDetails> {
    const existing = await this.findOne(input.tenant_id, input.kid_id, input.date)
    const now = new Date().toISOString()

    let payload: Record<string, unknown>
    if (input.action === "check_in") {
      const hour = new Date(now).getHours() + new Date(now).getMinutes() / 60
      payload = {
        check_in: now,
        checked_in_by: input.performed_by,
        status: hour >= 9 ? "late" : "in",
      }
    } else if (input.action === "check_out") {
      payload = {
        check_out: now,
        checked_out_by: input.performed_by,
        check_out_to: input.check_out_to ?? null,
        back_up_check_out_to: input.back_up_check_out_to ?? null,
        pickup_note: input.pickup_note ?? null,
        status: "out",
      }
    } else {
      payload = {
        status: "absent",
        absent_reason: input.absent_reason ?? null,
      }
    }

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from("kid_attendance")
        .update(payload)
        .eq("id", existing.id)
        .select(SELECT_WITH_DETAILS)
        .single()
      if (error) throw new Error(error.message)
      return toDetails(data as unknown as RawRow)
    }

    const { data, error } = await supabaseAdmin
      .from("kid_attendance")
      .insert([{
        kid_id: input.kid_id,
        class_id: input.class_id,
        date: input.date,
        tenant_id: input.tenant_id,
        ...payload,
      }])
      .select(SELECT_WITH_DETAILS)
      .single()
    if (error) throw new Error(error.message)
    return toDetails(data as unknown as RawRow)
  },

  async findByClassFiltered(
    tenantId: string,
    classId: string,
    filters: AttendanceFilters
  ): Promise<{ rows: KidAttendanceWithDetails[]; total: number }> {
    let query = supabaseAdmin
      .from("kid_attendance")
      .select(SELECT_WITH_DETAILS, { count: "exact" })
      .eq("tenant_id", tenantId)
      .eq("class_id", classId)
      .order("date", { ascending: false })

    if (filters.dateFrom) query = query.gte("date", filters.dateFrom)
    if (filters.dateTo) query = query.lte("date", filters.dateTo)
    if (filters.checkedOutBy) query = query.eq("checked_out_by", filters.checkedOutBy)
    if (filters.releasedTo) query = query.eq("check_out_to", filters.releasedTo)
    if (filters.status && filters.status !== "All") query = query.eq("status", filters.status.toLowerCase())

    const from = (filters.page - 1) * filters.pageSize
    const to = from + filters.pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query
    if (error) throw new Error(error.message)

    let rows = ((data ?? []) as unknown as RawRow[]).map(toDetails)

    // Name search is applied post-fetch since it's on a joined field PostgREST
    // can't filter directly without a separate ilike-on-kids subquery.
    if (filters.search) {
      const q = filters.search.toLowerCase()
      rows = rows.filter((r) => r.kid_name?.toLowerCase().includes(q))
    }

    return { rows, total: count ?? rows.length }
  },

  async getClassStats(tenantId: string, classId: string): Promise<AttendanceStats> {
    const today = new Date().toISOString().split("T")[0]
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const [{ data: todayRows, error: todayError }, { data: recentRows, error: recentError }] = await Promise.all([
      supabaseAdmin
        .from("kid_attendance")
        .select("status")
        .eq("tenant_id", tenantId)
        .eq("class_id", classId)
        .eq("date", today),
      supabaseAdmin
        .from("kid_attendance")
        .select("status")
        .eq("tenant_id", tenantId)
        .eq("class_id", classId)
        .gte("date", thirtyDaysAgo),
    ])
    if (todayError) throw new Error(todayError.message)
    if (recentError) throw new Error(recentError.message)

    const lateToday = (todayRows ?? []).filter((r) => r.status === "late").length
    const absentToday = (todayRows ?? []).filter((r) => r.status === "absent").length

    const total = recentRows?.length ?? 0
    const present = (recentRows ?? []).filter((r) => r.status === "in" || r.status === "late" || r.status === "out").length
    const presentRate30d = total > 0 ? Math.round((present / total) * 100) : 0

    return { presentRate30d, lateToday, absentToday }
  },
}
