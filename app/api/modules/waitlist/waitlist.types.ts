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

// A waitlist row whose kid has since been enrolled in a different class
// than the one they're still waitlisted for — surfaced as family activity.
export type ClassTransferEvent = {
  waitlist_id: string
  kid_id: string
  kid_name: string
  waitlisted_class_id: string
  waitlisted_class_name: string
  current_class_id: string
  current_class_name: string
  waitlisted_at: string
}
