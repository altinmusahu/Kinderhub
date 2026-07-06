import { supabaseAdmin } from "@/lib/supabase-admin"
import type { ClassRule, CreateClassRuleDto } from "./class_rules.types"

export const ClassRulesRepository = {
  async findByClassId(tenantId: string, classId: string): Promise<ClassRule[]> {
    const { data, error } = await supabaseAdmin
      .from("class_rules")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("class_id", classId)
      .order("sort_order", { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
  },

  async create(payload: CreateClassRuleDto): Promise<ClassRule> {
    const { data, error } = await supabaseAdmin
      .from("class_rules")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("class_rules")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}
