import { supabaseAdmin } from "@/lib/supabase-admin"
import type { CreateIncidentDto, IncidentWithDetails } from "./incidents.types"

export const IncidentsRepository = {
  async findByKidIds(tenantId: string, kidIds: string[]): Promise<IncidentWithDetails[]> {
    if (kidIds.length === 0) return []
    const { data, error } = await supabaseAdmin
      .from("incidents")
      .select("*, kids ( firstname, lastname ), users ( name, lastname )")
      .eq("tenant_id", tenantId)
      .in("kid_id", kidIds)
      .order("created_at", { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map((row) => {
      const kid = Array.isArray(row.kids) ? row.kids[0] : row.kids
      const reporter = Array.isArray(row.users) ? row.users[0] : row.users
      return {
        id: row.id,
        kid_id: row.kid_id,
        reported_by: row.reported_by,
        incident_type: row.incident_type,
        description: row.description,
        action_taken: row.action_taken,
        parent_notified: row.parent_notified,
        notified_at: row.notified_at,
        severity: row.severity,
        tenant_id: row.tenant_id,
        created_at: row.created_at,
        kid_name: kid ? `${kid.firstname} ${kid.lastname}` : null,
        reported_by_name: reporter ? `${reporter.name} ${reporter.lastname}` : null,
      }
    })
  },

  async create(payload: CreateIncidentDto): Promise<IncidentWithDetails> {
    const { data, error } = await supabaseAdmin
      .from("incidents")
      .insert([payload])
      .select("*, kids ( firstname, lastname ), users ( name, lastname )")
      .single()
    if (error) throw new Error(error.message)
    const kid = Array.isArray(data.kids) ? data.kids[0] : data.kids
    const reporter = Array.isArray(data.users) ? data.users[0] : data.users
    return {
      id: data.id,
      kid_id: data.kid_id,
      reported_by: data.reported_by,
      incident_type: data.incident_type,
      description: data.description,
      action_taken: data.action_taken,
      parent_notified: data.parent_notified,
      notified_at: data.notified_at,
      severity: data.severity,
      tenant_id: data.tenant_id,
      created_at: data.created_at,
      kid_name: kid ? `${kid.firstname} ${kid.lastname}` : null,
      reported_by_name: reporter ? `${reporter.name} ${reporter.lastname}` : null,
    }
  },

  async delete(id: string, tenantId: string, reportedBy: string): Promise<void> {
    const { data, error } = await supabaseAdmin
      .from("incidents")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .eq("reported_by", reportedBy)
      .select("id")
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) throw new Error("Incident not found or not owned by this user")
  },
}
