import { supabaseAdmin } from "@/lib/supabase-admin"
import type { Class, ClassWithRelations, CreateClassDto, UpdateClassDto } from "./classes.types"

export const ClassesRepository = {
  async findAllLight(): Promise<{ id: string; name: string }[]> {
    const { data, error } = await supabaseAdmin
      .from("classes")
      .select("id, name")
      .order("name", { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
  },

  async findAll(): Promise<ClassWithRelations[]> {
    const [{ data, error }, { data: kidRows, error: kidsError }, { data: waitlistRows, error: waitlistError }] = await Promise.all([
      supabaseAdmin
        .from("classes")
        .select(`
          *,
          locations ( name ),
          lead:users!classes_lead_user_id_fkey ( name, lastname ),
          assistant:users!classes_assistant_user_id_fkey ( name, lastname )
        `)
        .order("name", { ascending: true }),
      supabaseAdmin.from("kids").select("class_id").not("class_id", "is", null),
      supabaseAdmin.from("waitlists").select("class_id"),
    ])

    if (error) throw new Error(error.message)
    if (kidsError) throw new Error(kidsError.message)
    if (waitlistError) throw new Error(waitlistError.message)

    const enrolledCounts = new Map<string, number>()
    for (const row of kidRows ?? []) {
      enrolledCounts.set(row.class_id, (enrolledCounts.get(row.class_id) ?? 0) + 1)
    }
    const waitlistCounts = new Map<string, number>()
    for (const row of waitlistRows ?? []) {
      waitlistCounts.set(row.class_id, (waitlistCounts.get(row.class_id) ?? 0) + 1)
    }

    return (data ?? []).map((row) => ({
      id:                 row.id,
      name:               row.name,
      average_year:       row.average_year,
      location_id:        row.location_id,
      starts_at:          row.starts_at,
      ends_at:            row.ends_at,
      capacity:           row.capacity,
      lead_user_id:       row.lead_user_id,
      assistant_user_id:  row.assistant_user_id ?? null,
      schedule:           row.schedule ?? null,
      location_name:      row.locations?.name ?? null,
      lead_name:          row.lead ? `${row.lead.name} ${row.lead.lastname}` : null,
      assistant_name:     row.assistant ? `${row.assistant.name} ${row.assistant.lastname}` : null,
      enrolled_count:     enrolledCounts.get(row.id) ?? 0,
      waitlist_count:     waitlistCounts.get(row.id) ?? 0,
    }))
  },

  async findById(id: string): Promise<ClassWithRelations | null> {
    const [{ data, error }, { count: enrolledCount, error: kidsError }, { count: waitlistCount, error: waitlistError }] = await Promise.all([
      supabaseAdmin
        .from("classes")
        .select(`
          *,
          locations ( name ),
          lead:users!classes_lead_user_id_fkey ( name, lastname ),
          assistant:users!classes_assistant_user_id_fkey ( name, lastname )
        `)
        .eq("id", id)
        .maybeSingle(),
      supabaseAdmin.from("kids").select("id", { count: "exact", head: true }).eq("class_id", id),
      supabaseAdmin.from("waitlists").select("id", { count: "exact", head: true }).eq("class_id", id),
    ])

    if (error) throw new Error(error.message)
    if (!data) return null
    if (kidsError) throw new Error(kidsError.message)
    if (waitlistError) throw new Error(waitlistError.message)

    return {
      id:                 data.id,
      name:               data.name,
      average_year:       data.average_year,
      location_id:        data.location_id,
      starts_at:          data.starts_at,
      ends_at:            data.ends_at,
      capacity:           data.capacity,
      lead_user_id:       data.lead_user_id,
      assistant_user_id:  data.assistant_user_id ?? null,
      schedule:           data.schedule ?? null,
      location_name:      data.locations?.name ?? null,
      lead_name:          data.lead ? `${data.lead.name} ${data.lead.lastname}` : null,
      assistant_name:     data.assistant ? `${data.assistant.name} ${data.assistant.lastname}` : null,
      enrolled_count:     enrolledCount ?? 0,
      waitlist_count:     waitlistCount ?? 0,
    }
  },

  async create(payload: CreateClassDto): Promise<Class> {
    const { data, error } = await supabaseAdmin
      .from("classes")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, payload: UpdateClassDto): Promise<Class> {
    const { data, error } = await supabaseAdmin
      .from("classes")
      .update(payload)
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("classes")
      .delete()
      .eq("id", id)
    if (error) throw new Error(error.message)
  },
}
