export type WaitlistEntry = {
  id: string
  class_id: string
  firstname: string
  lastname: string
  date_of_birth: string
  note: string | null
  created_at: string
  tenant_id: string
}

export type CreateWaitlistDto = {
  class_id: string
  firstname: string
  lastname: string
  date_of_birth: string
  note: string | null
  tenant_id: string
}
