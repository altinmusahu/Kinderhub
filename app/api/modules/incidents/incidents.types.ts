export type Incident = {
  id: string
  kid_id: string
  reported_by: string
  incident_type: string
  description: string
  action_taken: string | null
  parent_notified: boolean
  notified_at: string
  severity: string
  tenant_id: string
  created_at: string
}

export type IncidentWithDetails = Incident & {
  kid_name: string | null
  reported_by_name: string | null
}

export type CreateIncidentDto = Omit<Incident, "id" | "created_at">
