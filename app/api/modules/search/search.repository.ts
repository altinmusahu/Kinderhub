import { supabaseAdmin } from "@/lib/supabase-admin"
import type { SearchClassResult, SearchFamilyResult, SearchKidResult } from "./search.types"

const RESULT_LIMIT = 6

export const SearchRepository = {
  async searchFamilies(tenantId: string, query: string): Promise<SearchFamilyResult[]> {
    const { data, error } = await supabaseAdmin
      .from("families")
      .select("id, name, status")
      .eq("tenant_id", tenantId)
      .ilike("name", `%${query}%`)
      .limit(RESULT_LIMIT)
    if (error) throw new Error(error.message)
    return data ?? []
  },

  async searchClasses(query: string): Promise<SearchClassResult[]> {
    const { data, error } = await supabaseAdmin
      .from("classes")
      .select("id, name")
      .ilike("name", `%${query}%`)
      .limit(RESULT_LIMIT)
    if (error) throw new Error(error.message)
    return data ?? []
  },

  async searchKids(tenantId: string, query: string): Promise<SearchKidResult[]> {
    const pattern = `%${query}%`
    const [{ data: byFirst, error: firstError }, { data: byLast, error: lastError }] = await Promise.all([
      supabaseAdmin
        .from("kids")
        .select("id, firstname, lastname, family_id, families ( name )")
        .eq("tenant_id", tenantId)
        .ilike("firstname", pattern)
        .limit(RESULT_LIMIT),
      supabaseAdmin
        .from("kids")
        .select("id, firstname, lastname, family_id, families ( name )")
        .eq("tenant_id", tenantId)
        .ilike("lastname", pattern)
        .limit(RESULT_LIMIT),
    ])
    if (firstError) throw new Error(firstError.message)
    if (lastError) throw new Error(lastError.message)

    const merged = new Map<string, SearchKidResult>()
    for (const row of [...(byFirst ?? []), ...(byLast ?? [])]) {
      const family = Array.isArray(row.families) ? row.families[0] : row.families
      merged.set(row.id, {
        id: row.id,
        firstname: row.firstname,
        lastname: row.lastname,
        family_id: row.family_id,
        family_name: family?.name ?? null,
      })
    }
    return [...merged.values()].slice(0, RESULT_LIMIT)
  },
}
