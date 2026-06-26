export type WaitlistEntry = {
  id: string
  kid_id: string
  class_id: string
  created_at: string
  tenant_id: string
  // joined from kids table
  firstname?: string
  lastname?: string
  date_of_birth?: string
}

export type CreateWaitlistDto = {
  kid_id: string
  class_id: string
  tenant_id: string
}
