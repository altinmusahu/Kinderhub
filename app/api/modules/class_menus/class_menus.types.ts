export type MealType = "breakfast" | "snack" | "lunch"

export type ClassMenu = {
  id: string
  tenant_id: string
  class_id: string
  date: string
  meal_type: MealType
  description: string
  created_by: string
  created_at: string
}

export type ClassMenuCell = {
  date: string
  meal_type: MealType
  description: string | null
  id: string | null
  created_by_name: string | null
  created_at: string | null
}

export type UpsertClassMenuDto = {
  tenant_id: string
  class_id: string
  date: string
  meal_type: MealType
  description: string
  created_by: string
}

export type ClassLight = {
  id: string
  name: string
}
