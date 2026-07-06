export type ClassChecklistItem = {
  id: string
  class_id: string
  tenant_id: string
  category: string
  item_name: string
  is_mandatory: boolean
  applies_to: string
  sort_order: number
  created_at: string
}

export type CreateClassChecklistItemDto = Omit<ClassChecklistItem, "id" | "created_at">
export type UpdateClassChecklistItemDto = Partial<Omit<CreateClassChecklistItemDto, "tenant_id" | "class_id">>
