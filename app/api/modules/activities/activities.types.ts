export type Activities = {
  id: string
  executor_id: string
  executor_name: string
  executor_lastname: string
  activity: string
  created_at: string
  tenant_id: string
}

export type CreateActivitiesDto = {
  executor_id: string
  activity: string
  tenant_id: string
}

export type UpdateActivitiesDto = Partial<CreateActivitiesDto>