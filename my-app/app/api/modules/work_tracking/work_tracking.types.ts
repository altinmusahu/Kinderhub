export type WorkTracking = {
  id: string
  tenant_id: string
  department_id: string | null
  start_date: string
  end_date: string | null
  responsible_user_id: string | null
  user_id: string
}

export type CreateWorkTrackingDto = Omit<WorkTracking, "id">

export type UpdateWorkTrackingDto = Partial<Omit<WorkTracking, "id" | "tenant_id" | "user_id">>
