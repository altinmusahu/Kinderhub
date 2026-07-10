import { supabaseAdmin } from "@/lib/supabase-admin"
import type {
  ClassCurriculumItem,
  CreateClassCurriculumItemDto,
  UpdateClassCurriculumItemDto,
} from "./class_curriculum_items.types"

export const ClassCurriculumItemsRepository = {
  async findByCurriculumId(tenantId: string, curriculumId: string): Promise<ClassCurriculumItem[]> {
    const { data, error } = await supabaseAdmin
      .from("class_curriculum_items")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("curriculum_id", curriculumId)
      .order("sort_order", { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
  },

  async create(payload: CreateClassCurriculumItemDto): Promise<ClassCurriculumItem> {
    const { data, error } = await supabaseAdmin
      .from("class_curriculum_items")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, tenantId: string, payload: UpdateClassCurriculumItemDto): Promise<ClassCurriculumItem> {
    const { data, error } = await supabaseAdmin
      .from("class_curriculum_items")
      .update(payload)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("class_curriculum_items")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}
