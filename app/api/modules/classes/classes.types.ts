export type Class = {
  id: string
  name: string
  average_year: string
  location_id: string
  starts_at: string
  ends_at: string
  capacity: number
  lead_user_id: string
  assistant_user_id: string | null
  schedule: Record<string, unknown> | null
}

export type ClassWithRelations = Class & {
  location_name: string | null
  lead_name: string | null
  assistant_name: string | null
  enrolled_count: number
  waitlist_count: number
}

export type CreateClassDto = Omit<Class, "id">
export type UpdateClassDto = Partial<CreateClassDto>
