import { supabaseAdmin } from "@/lib/supabase-admin"
import type {
  ClassChecklistItem,
  CreateClassChecklistItemDto,
  UpdateClassChecklistItemDto,
} from "./class_checklist_items.types"

export const ClassChecklistItemsRepository = {
  async findByClassId(tenantId: string, classId: string): Promise<ClassChecklistItem[]> {
    const { data, error } = await supabaseAdmin
      .from("class_checklist_items")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("class_id", classId)
      .order("sort_order", { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
  },

  async create(payload: CreateClassChecklistItemDto): Promise<ClassChecklistItem> {
    const { data, error } = await supabaseAdmin
      .from("class_checklist_items")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, tenantId: string, payload: UpdateClassChecklistItemDto): Promise<ClassChecklistItem> {
    const { data, error } = await supabaseAdmin
      .from("class_checklist_items")
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
      .from("class_checklist_items")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}
