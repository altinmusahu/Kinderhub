import { supabaseAdmin } from "@/lib/supabase-admin"
import { CreateKidsDto, Kids, KidWithClassIdNull, UpdateKidsDto } from "./kids.types"

export const KidsRepository = {
  async findAll(tenantId: string): Promise<Kids[]> {
    const { data, error } = await supabaseAdmin
      .from("kids")
      .select("*")
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
    return data
  },

  async findKidsByClassId(tenant_id: string, class_id: string) : Promise<Kids[]> {
    const { data, error } = await supabaseAdmin
      .from("kids")
      .select("*")
      .eq("tenant_id", tenant_id)
      .eq("class_id", class_id)

      if(error) throw new Error(error.message);

      return data;
  },

  async findKidsByClassIdNullable(tenantId: string) : Promise<KidWithClassIdNull[]> {
    const { data, error } = await supabaseAdmin
      .from("kids")
      .select("id, firstname, lastname")
      .eq("tenant_id", tenantId)
      .is("class_id", null)

      if(error) {
        throw error;
      }

      return (data ?? []) as KidWithClassIdNull[];
  },

  async findById(id: string, tenantId: string): Promise<Kids | null> {
    const { data, error } = await supabaseAdmin
      .from("kids")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async create(payload: CreateKidsDto): Promise<Kids> {
    const { data, error } = await supabaseAdmin
      .from("kids")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, tenantId: string, payload: UpdateKidsDto): Promise<Kids> {
    const { data, error } = await supabaseAdmin
      .from("kids")
      .update(payload)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async updateClassId(id: string, tenant_id: string, class_id: string) : Promise<void> {
    const { error } = await supabaseAdmin
      .from("kids")
      .update({ class_id: class_id })
      .eq("id", id)
      .eq("tenant_id", tenant_id)

    if (error) {
      throw error;
    }
  },

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("kids")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}