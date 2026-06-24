import { supabaseAdmin } from "@/lib/supabase-admin"
import { CreateDepartmentDto, Department, UpdateDepartmentDto } from "./department.types"

export const DepartmentRepository = {
  async findAll(tenantId: string): Promise<Department[]> {
    const { data, error } = await supabaseAdmin
      .from("departments")
      .select("*")
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
    return data
  },

  async findById(id: string, tenantId: string): Promise<Department | null> {
    const { data, error } = await supabaseAdmin
      .from("departments")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: CreateDepartmentDto): Promise<Department> {
    const { data, error } = await supabaseAdmin
      .from("departments")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, tenantId: string, payload: UpdateDepartmentDto): Promise<Department> {
    const { data, error } = await supabaseAdmin
      .from("departments")
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
      .from("departments")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}