export type ClassEvent = {
  id: string
  class_id: string
  tenant_id: string
  title: string
  location: string | null
  starts_at: string
  ends_at: string | null
  created_at: string
}

export type CreateClassEventDto = Omit<ClassEvent, "id" | "created_at">
