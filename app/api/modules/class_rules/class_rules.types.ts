export type ClassRule = {
  id: string
  class_id: string
  tenant_id: string
  rule_text: string
  sort_order: number
  created_at: string
}

export type CreateClassRuleDto = Omit<ClassRule, "id" | "created_at">
