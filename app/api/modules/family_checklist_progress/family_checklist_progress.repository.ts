import { supabaseAdmin } from "@/lib/supabase-admin"
import type { FamilyChecklistProgress, UpsertFamilyChecklistProgressDto } from "./family_checklist_progress.types"

export const FamilyChecklistProgressRepository = {
  async findByKidIds(kidIds: string[]): Promise<FamilyChecklistProgress[]> {
    if (kidIds.length === 0) return []
    const { data, error } = await supabaseAdmin
      .from("family_checklist_progress")
      .select("*")
      .in("kid_id", kidIds)
    if (error) throw new Error(error.message)
    return data ?? []
  },

  async upsert(payload: UpsertFamilyChecklistProgressDto): Promise<FamilyChecklistProgress> {
    const { data: existing, error: findError } = await supabaseAdmin
      .from("family_checklist_progress")
      .select("id")
      .eq("kid_id", payload.kid_id)
      .eq("checklist_item_id", payload.checklist_item_id)
      .maybeSingle()
    if (findError) throw new Error(findError.message)

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from("family_checklist_progress")
        .update({ is_checked: payload.is_checked, checked_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data
    }

    const { data, error } = await supabaseAdmin
      .from("family_checklist_progress")
      .insert([{ ...payload, checked_at: new Date().toISOString() }])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },
}
