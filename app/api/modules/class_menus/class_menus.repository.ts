import { supabaseAdmin } from "@/lib/supabase-admin"
import { ClassMenu, MealType, UpsertClassMenuDto } from "./class_menus.types"

export const ClassMenusRepository = {
  async findForClassAndRange(tenantId: string, classId: string, startDate: string, endDate: string): Promise<(ClassMenu & { created_by_name: string | null })[]> {
    const { data, error } = await supabaseAdmin
      .from("class_menus")
      .select(`
        *,
        users ( name, lastname )
      `)
      .eq("tenant_id", tenantId)
      .eq("class_id", classId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
    if (error) throw new Error(error.message)

    return (data ?? []).map((row) => ({
      id: row.id,
      tenant_id: row.tenant_id,
      class_id: row.class_id,
      date: row.date,
      meal_type: row.meal_type,
      description: row.description,
      created_by: row.created_by,
      created_at: row.created_at,
      created_by_name: row.users ? `${row.users.name} ${row.users.lastname}` : null,
    }))
  },

  async findOne(tenantId: string, classId: string, date: string, mealType: MealType): Promise<ClassMenu | null> {
    const { data, error } = await supabaseAdmin
      .from("class_menus")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("class_id", classId)
      .eq("date", date)
      .eq("meal_type", mealType)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: UpsertClassMenuDto): Promise<ClassMenu> {
    const { data, error } = await supabaseAdmin
      .from("class_menus")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, description: string, createdBy: string): Promise<ClassMenu> {
    const { data, error } = await supabaseAdmin
      .from("class_menus")
      .update({ description, created_by: createdBy })
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("class_menus")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}
