import { supabaseAdmin } from "@/lib/supabase-admin"
import type { ClassCurriculumWithCreator, CreateClassCurriculumDto, UpdateClassCurriculumDto } from "./class_curriculum.types"

const SELECT = "*, users!class_curriculum_created_by_fkey ( name, lastname )"

export const ClassCurriculumRepository = {
  async findByClassId(tenantId: string, classId: string): Promise<ClassCurriculumWithCreator[]> {
    const { data, error } = await supabaseAdmin
      .from("class_curriculum")
      .select(SELECT)
      .eq("tenant_id", tenantId)
      .eq("class_id", classId)
      .order("period_start", { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map((row) => {
      const creator = Array.isArray(row.users) ? row.users[0] : row.users
      return {
        id: row.id,
        class_id: row.class_id,
        tenant_id: row.tenant_id,
        period_type: row.period_type,
        period_start: row.period_start,
        period_end: row.period_end,
        title: row.title,
        theme: row.theme,
        status: row.status,
        created_by: row.created_by,
        updated_by: row.updated_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
        created_by_name: creator ? `${creator.name} ${creator.lastname}` : null,
      }
    })
  },

  async create(payload: CreateClassCurriculumDto): Promise<ClassCurriculumWithCreator> {
    const { data, error } = await supabaseAdmin
      .from("class_curriculum")
      .insert([payload])
      .select(SELECT)
      .single()
    if (error) throw new Error(error.message)
    const creator = Array.isArray(data.users) ? data.users[0] : data.users
    return {
      id: data.id,
      class_id: data.class_id,
      tenant_id: data.tenant_id,
      period_type: data.period_type,
      period_start: data.period_start,
      period_end: data.period_end,
      title: data.title,
      theme: data.theme,
      status: data.status,
      created_by: data.created_by,
      updated_by: data.updated_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
      created_by_name: creator ? `${creator.name} ${creator.lastname}` : null,
    }
  },

  async update(id: string, tenantId: string, payload: UpdateClassCurriculumDto): Promise<ClassCurriculumWithCreator> {
    const { data, error } = await supabaseAdmin
      .from("class_curriculum")
      .update(payload)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select(SELECT)
      .single()
    if (error) throw new Error(error.message)
    const creator = Array.isArray(data.users) ? data.users[0] : data.users
    return {
      id: data.id,
      class_id: data.class_id,
      tenant_id: data.tenant_id,
      period_type: data.period_type,
      period_start: data.period_start,
      period_end: data.period_end,
      title: data.title,
      theme: data.theme,
      status: data.status,
      created_by: data.created_by,
      updated_by: data.updated_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
      created_by_name: creator ? `${creator.name} ${creator.lastname}` : null,
    }
  },

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("class_curriculum")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}
