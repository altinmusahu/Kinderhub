import { supabaseAdmin } from "@/lib/supabase-admin"
import type { ClassTransferEvent, CreateWaitlistDto, WaitlistEntry } from "./waitlist.types"

export const WaitlistRepository = {
  async findByClassId(tenantId: string, classId: string): Promise<WaitlistEntry[]> {
    const { data, error } = await supabaseAdmin
      .from("waitlists")
      .select("*, kids ( firstname, lastname, date_of_birth, class_id )")
      .eq("tenant_id", tenantId)
      .eq("class_id", classId)
      .order("created_at", { ascending: true })
    if (error) throw new Error(error.message)
    return (data ?? [])
      .filter(row => row.kids?.class_id == null)
      .map(row => ({
        id:             row.id,
        kid_id:         row.kid_id,
        class_id:       row.class_id,
        created_at:     row.created_at,
        tenant_id:      row.tenant_id,
        firstname:      row.kids?.firstname,
        lastname:       row.kids?.lastname,
        date_of_birth:  row.kids?.date_of_birth,
      }))
  },

  // Waitlist rows for this family's kids where the kid's actual class_id
  // no longer matches the class they're still listed as waiting for —
  // i.e. they got enrolled somewhere (else) after being waitlisted.
  async findClassTransfersForFamily(tenantId: string, familyId: string): Promise<ClassTransferEvent[]> {
    const { data, error } = await supabaseAdmin
      .from("waitlists")
      .select(`
        id,
        created_at,
        class_id,
        kids!inner ( id, firstname, lastname, class_id, family_id ),
        waitlisted_class:classes!waitlists_class_id_fkey ( name )
      `)
      .eq("tenant_id", tenantId)
      .eq("kids.family_id", familyId)
    if (error) throw new Error(error.message)

    type Row = {
      id: string
      created_at: string
      class_id: string
      kids: { id: string; firstname: string; lastname: string; class_id: string | null }[] | { id: string; firstname: string; lastname: string; class_id: string | null }
      waitlisted_class: { name: string }[] | { name: string } | null
    }

    const rows = (data ?? []) as unknown as Row[]

    const normalized = rows.map((row) => {
      const kid = Array.isArray(row.kids) ? row.kids[0] : row.kids
      const waitlistedClass = Array.isArray(row.waitlisted_class) ? row.waitlisted_class[0] : row.waitlisted_class
      return { id: row.id, created_at: row.created_at, class_id: row.class_id, kid, waitlistedClass }
    })

    const transferred = normalized.filter(
      (row) => row.kid?.class_id && row.kid.class_id !== row.class_id
    )
    if (transferred.length === 0) return []

    const currentClassIds = [...new Set(transferred.map((row) => row.kid!.class_id as string))]
    const { data: currentClasses, error: classError } = await supabaseAdmin
      .from("classes")
      .select("id, name")
      .in("id", currentClassIds)
    if (classError) throw new Error(classError.message)
    const currentClassName = new Map((currentClasses ?? []).map((c) => [c.id, c.name]))

    return transferred.map((row) => ({
      waitlist_id:           row.id,
      kid_id:                row.kid!.id,
      kid_name:              `${row.kid!.firstname} ${row.kid!.lastname}`,
      waitlisted_class_id:   row.class_id,
      waitlisted_class_name: row.waitlistedClass?.name ?? "Unknown class",
      current_class_id:      row.kid!.class_id as string,
      current_class_name:    currentClassName.get(row.kid!.class_id as string) ?? "Unknown class",
      waitlisted_at:         row.created_at,
    }))
  },

  async create(payload: CreateWaitlistDto): Promise<WaitlistEntry> {
    const { data, error } = await supabaseAdmin
      .from("waitlists")
      .insert([payload])
      .select("*, kids ( firstname, lastname, date_of_birth )")
      .single()
    if (error) throw new Error(error.message)
    return {
      id:             data.id,
      kid_id:         data.kid_id,
      class_id:       data.class_id,
      created_at:     data.created_at,
      tenant_id:      data.tenant_id,
      firstname:      data.kids?.firstname,
      lastname:       data.kids?.lastname,
      date_of_birth:  data.kids?.date_of_birth,
    }
  },

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("waitlists")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}
