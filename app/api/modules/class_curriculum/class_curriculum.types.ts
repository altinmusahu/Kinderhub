export type ClassCurriculum = {
  id: string
  class_id: string
  tenant_id: string
  period_type: string
  period_start: string
  period_end: string
  title: string | null
  theme: string | null
  status: string
  created_by: string
  updated_by: string | null
  created_at: string
  updated_at: string | null
}

export type ClassCurriculumWithCreator = ClassCurriculum & {
  created_by_name: string | null
}

export type CreateClassCurriculumDto = Omit<ClassCurriculum, "id" | "title" | "theme" | "status" | "updated_by" | "created_at" | "updated_at"> & {
  title?: string | null
  theme?: string | null
  status?: string
}

export type UpdateClassCurriculumDto = Partial<Pick<ClassCurriculum, "period_type" | "period_start" | "period_end" | "title" | "theme" | "status">> & {
  updated_by: string
}
