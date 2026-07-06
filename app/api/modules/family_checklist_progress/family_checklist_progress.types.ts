export type FamilyChecklistProgress = {
  id: string
  kid_id: string
  checklist_item_id: string
  is_checked: boolean
  checked_at: string
}

export type UpsertFamilyChecklistProgressDto = {
  kid_id: string
  checklist_item_id: string
  is_checked: boolean
}

export type KidChecklistProgress = {
  kid_id: string
  kid_name: string
  done: number
  of: number
  missing: string[]
}

export type KidChecklistItemState = {
  checklist_item_id: string
  item_name: string
  category: string
  is_mandatory: boolean
  applies_to: string
  is_checked: boolean
}

export type KidChecklistDetail = {
  kid_id: string
  kid_name: string
  items: KidChecklistItemState[]
}
