export type ClassCurriculumItem = {
  id: string
  curriculum_id: string
  tenant_id: string
  specific_date: string | null
  day_of_week: string | null
  activity_name: string
  description: string | null
  learning_domain: string | null
  materials_needed: string | null
  sort_order: number
  created_at: string
}

export type CreateClassCurriculumItemDto = {
  curriculum_id: string
  tenant_id: string
  specific_date?: string | null
  day_of_week?: string | null
  activity_name: string
  description?: string | null
  learning_domain?: string | null
  materials_needed?: string | null
  sort_order: number
}
export type UpdateClassCurriculumItemDto = Partial<Omit<CreateClassCurriculumItemDto, "tenant_id" | "curriculum_id">>
