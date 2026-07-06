import { KidAttendanceRepository } from "./kid_attendance.repository"
import { KidsRepository } from "../kids/kids.repository"
import type {
  AttendanceFilters,
  AttendanceStats,
  KidAttendanceWithDetails,
  UpsertKidAttendanceDto,
} from "./kid_attendance.types"

export const KidAttendanceService = {
  // Merges the class roster with today's (or the given date's) attendance rows —
  // kids with no row yet are returned as synthetic "pending" entries so the
  // Take Attendance modal always shows the full roster, not just marked kids.
  async getForClassAndDate(tenantId: string, classId: string, date: string): Promise<KidAttendanceWithDetails[]> {
    const [roster, rows] = await Promise.all([
      KidsRepository.findKidsByClassId(tenantId, classId),
      KidAttendanceRepository.findByClassAndDate(tenantId, classId, date),
    ])

    const byKidId = new Map(rows.map((r) => [r.kid_id, r]))

    return roster.map((kid) => {
      const existing = byKidId.get(kid.id)
      if (existing) return existing
      return {
        id: `pending-${kid.id}`,
        kid_id: kid.id,
        class_id: classId,
        date,
        check_in: null,
        check_out: null,
        checked_in_by: null,
        checked_out_by: null,
        check_out_to: null,
        back_up_check_out_to: null,
        pickup_note: null,
        status: "pending",
        absent_reason: null,
        tenant_id: tenantId,
        created_at: date,
        kid_name: `${kid.firstname} ${kid.lastname}`,
        checked_in_by_name: null,
        checked_out_by_name: null,
        check_out_to_name: null,
      }
    })
  },

  async upsertForKid(input: UpsertKidAttendanceDto): Promise<KidAttendanceWithDetails> {
    return KidAttendanceRepository.upsertForKid(input)
  },

  async getFilteredForClass(
    tenantId: string,
    classId: string,
    filters: AttendanceFilters
  ): Promise<{ rows: KidAttendanceWithDetails[]; total: number }> {
    return KidAttendanceRepository.findByClassFiltered(tenantId, classId, filters)
  },

  async getStatsForClass(tenantId: string, classId: string): Promise<AttendanceStats> {
    return KidAttendanceRepository.getClassStats(tenantId, classId)
  },
}
