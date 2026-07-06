"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import type { KidAttendanceWithDetails, AttendanceStats } from "@/app/api/modules/kid_attendance/kid_attendance.types"
import ExportAttendanceButton from "./ExportAttendanceButton"
import { onAttendanceUpdated } from "@/lib/attendance-events"

type StaffOption = { id: string; name: string; lastname: string }

const PAGE_SIZE = 20
const STATUS_TONE: Record<string, { bg: string; color: string; label: string }> = {
  in: { bg: "var(--kh-sage-bg)", color: "var(--kh-sage-d)", label: "Present" },
  late: { bg: "#FEF3E2", color: "#B07A1A", label: "Late" },
  out: { bg: "var(--kh-sage-bg)", color: "var(--kh-sage-d)", label: "Present" },
  absent: { bg: "#FDEAEA", color: "#C0392B", label: "Absent" },
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
}

function fmtTime(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

export default function AttendanceTab({ classId }: { classId: string }) {
  const [rows, setRows] = useState<KidAttendanceWithDetails[] | null>(null)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [staff, setStaff] = useState<StaffOption[]>([])
  const [loaded, setLoaded] = useState(false)

  const [search, setSearch] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [checkedOutBy, setCheckedOutBy] = useState("")
  const [status, setStatus] = useState("All")
  const [page, setPage] = useState(1)
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    if (loaded) return
    setLoaded(true)
    fetch("/api/users").then((r) => r.json()).then((d) => setStaff(Array.isArray(d) ? d : [])).catch(() => setStaff([]))
  }, [loaded])

  // Live-refresh when the Take Attendance modal records a check-in/out/absence for this class.
  useEffect(() => onAttendanceUpdated(classId, () => setRefreshTick((t) => t + 1)), [classId])

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (dateFrom) params.set("dateFrom", dateFrom)
    if (dateTo) params.set("dateTo", dateTo)
    if (checkedOutBy) params.set("checkedOutBy", checkedOutBy)
    if (status !== "All") params.set("status", status)
    params.set("page", String(page))
    params.set("pageSize", String(PAGE_SIZE))
    return params.toString()
  }, [search, dateFrom, dateTo, checkedOutBy, status, page])

  useEffect(() => {
    fetch(`/api/classes/${classId}/attendance?${queryString}`)
      .then((r) => r.json())
      .then((d: { rows: KidAttendanceWithDetails[]; total: number; stats: AttendanceStats }) => {
        setRows(Array.isArray(d.rows) ? d.rows : [])
        setTotal(d.total ?? 0)
        setStats(d.stats ?? null)
      })
  }, [classId, queryString, refreshTick])

  // the export query should carry the current filters but not pagination
  const exportQueryString = useMemo(() => {
    const params = new URLSearchParams(queryString)
    params.delete("page")
    params.delete("pageSize")
    return params.toString()
  }, [queryString])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Stats */}
      <div className="kh-kpi-strip" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { label: "Avg 30d", value: stats ? `${stats.presentRate30d}%` : "—" },
          { label: "Late today", value: stats ? stats.lateToday : "—" },
          { label: "Absent today", value: stats ? stats.absentToday : "—" },
        ].map((s) => (
          <div key={s.label} className="kh-card" style={{ padding: "13px 16px" }}>
            <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)", textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</div>
            <div style={{ fontFamily: "var(--kh-font-serif)", fontSize: 26, color: "var(--kh-ink-900)", marginTop: 5, lineHeight: 1.1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 11px", border: "1px solid var(--kh-border)", borderRadius: 9, background: "var(--kh-surface)", fontSize: 12.5, width: 220 }}>
          <Search size={13} style={{ color: "var(--kh-ink-400)", flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search child name…"
            style={{ border: "none", outline: "none", background: "transparent", fontSize: 12.5, width: "100%" }}
          />
        </div>
        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} style={{ border: "1px solid var(--kh-border)", borderRadius: 9, padding: "6px 9px", fontSize: 12, background: "var(--kh-surface)" }} />
        <span style={{ fontSize: 12, color: "var(--kh-ink-400)" }}>–</span>
        <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} style={{ border: "1px solid var(--kh-border)", borderRadius: 9, padding: "6px 9px", fontSize: 12, background: "var(--kh-surface)" }} />
        <select value={checkedOutBy} onChange={(e) => { setCheckedOutBy(e.target.value); setPage(1) }} style={{ border: "1px solid var(--kh-border)", borderRadius: 9, padding: "7px 9px", fontSize: 12.5, background: "var(--kh-surface)" }}>
          <option value="">Checked out by · All staff</option>
          {staff.map((s) => <option key={s.id} value={s.id}>{s.name} {s.lastname}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} style={{ border: "1px solid var(--kh-border)", borderRadius: 9, padding: "7px 9px", fontSize: 12.5, background: "var(--kh-surface)" }}>
          <option value="All">Status · All</option>
          <option value="in">Present (in)</option>
          <option value="late">Late</option>
          <option value="out">Present (out)</option>
          <option value="absent">Absent</option>
        </select>
        <div style={{ flex: 1 }} />
        <ExportAttendanceButton classId={classId} queryString={exportQueryString} />
        <span style={{ fontSize: 11.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>{total} record{total === 1 ? "" : "s"}</span>
      </div>

      {/* Table */}
      <div className="kh-card" style={{ overflow: "hidden" }}>
        {rows === null ? (
          <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 13, color: "var(--kh-ink-400)" }}>No attendance records match these filters.</div>
        ) : (
          <div className="kh-table-scroll">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr>
                  {["Child", "Date", "Check-in", "Check-out", "Released to", "Pickup note", "Status"].map((h) => (
                    <th key={h} style={{ textAlign: "left", fontWeight: 500, color: "var(--kh-ink-400)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", padding: "10px 14px", borderBottom: "1px solid var(--kh-ink-100)", fontFamily: "var(--kh-font-mono)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const tone = STATUS_TONE[r.status ?? ""] ?? { bg: "var(--kh-ink-50)", color: "var(--kh-ink-600)", label: r.status ?? "—" }
                  return (
                    <tr key={r.id}>
                      <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 7, background: "var(--kh-peach-bg)", color: "var(--kh-peach-d)", fontSize: 9.5, fontWeight: 700, flexShrink: 0 }}>
                            {initials(r.kid_name ?? "?")}
                          </span>
                          <span style={{ fontWeight: 600, color: "var(--kh-ink-900)" }}>{r.kid_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)", fontFamily: "var(--kh-font-mono)", fontSize: 11.5, color: "var(--kh-ink-600)" }}>
                        {new Date(r.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </td>
                      <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)" }}>
                        {r.check_in ? (
                          <>
                            <div style={{ fontFamily: "var(--kh-font-mono)", fontSize: 12, color: "var(--kh-ink-800)" }}>{fmtTime(r.check_in)}</div>
                            <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)" }}>by {r.checked_in_by_name ?? "—"}</div>
                          </>
                        ) : <span style={{ color: "var(--kh-ink-300)" }}>—</span>}
                      </td>
                      <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)" }}>
                        {r.check_out ? (
                          <>
                            <div style={{ fontFamily: "var(--kh-font-mono)", fontSize: 12, color: "var(--kh-ink-800)" }}>{fmtTime(r.check_out)}</div>
                            <div style={{ fontSize: 10.5, color: "var(--kh-ink-400)" }}>by {r.checked_out_by_name ?? "—"}</div>
                          </>
                        ) : <span style={{ color: "var(--kh-ink-300)" }}>—</span>}
                      </td>
                      <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)" }}>
                        {r.check_out_to_name ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 6, background: "var(--kh-peach-bg)", color: "var(--kh-peach-d)", fontSize: 8.5, fontWeight: 700, flexShrink: 0 }}>
                              {initials(r.check_out_to_name)}
                            </span>
                            <span style={{ fontSize: 12, color: "var(--kh-ink-800)" }}>{r.check_out_to_name}</span>
                          </div>
                        ) : r.back_up_check_out_to ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 10.5, fontWeight: 500, color: "#B07A1A", background: "#FEF3E2", borderRadius: 999, padding: "2px 7px" }}>Backup</span>
                            <span style={{ fontSize: 11.5, color: "var(--kh-ink-700)" }}>{r.back_up_check_out_to}</span>
                          </div>
                        ) : <span style={{ color: "var(--kh-ink-300)" }}>—</span>}
                      </td>
                      <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)", fontSize: 11.5, color: "var(--kh-ink-500)", maxWidth: 170 }}>
                        {r.pickup_note || (r.absent_reason ? <span style={{ color: "var(--kh-pink-d)" }}>{r.absent_reason}</span> : <span style={{ color: "var(--kh-ink-300)" }}>—</span>)}
                      </td>
                      <td style={{ padding: "11px 14px", borderBottom: "1px solid var(--kh-ink-50)" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: tone.color, background: tone.bg, borderRadius: 999, padding: "2px 8px" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: tone.color }} /> {tone.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderTop: "1px solid var(--kh-ink-50)" }}>
          <span style={{ fontSize: 11.5, color: "var(--kh-ink-400)", fontFamily: "var(--kh-font-mono)" }}>
            Showing {rows ? rows.length : 0} of {total} records
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} style={{ padding: "5px 10px", fontSize: 11.5, border: "1px solid var(--kh-border)", borderRadius: 7, background: "var(--kh-surface)", color: "var(--kh-ink-600)", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}>Previous</button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ padding: "5px 10px", fontSize: 11.5, border: "1px solid var(--kh-border)", borderRadius: 7, background: "var(--kh-surface)", color: "var(--kh-ink-600)", cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.5 : 1 }}>Next</button>
        </div>
      </div>
    </div>
  )
}
