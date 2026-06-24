import { supabaseAdmin } from "@/lib/supabase-admin"
import { Activities, CreateActivitiesDto } from "./activities.types"

export const ActivitiesRepository = {

    async findAll(tenantId: string): Promise<Activities[]> {
        const { data, error } = await supabaseAdmin
            .from("activities")
            .select(`
            id,
            activity,
            created_at,
            executor_id,
            tenant_id,
            users!activities_executor_id_fkey (
                name,
                lastname
            )
            `).eq("tenant_id", tenantId)

        if (error) throw new Error(error.message)

        return data.map((item) => ({
            id: item.id,
            executor_id: item.executor_id,
            executor_name: item.users?.[0]?.name ?? "",
            executor_lastname: item.users?.[0]?.lastname ?? "",
            activity: item.activity,
            created_at: item.created_at,
            tenant_id: item.tenant_id
        }))
    },

    async create(payload: CreateActivitiesDto): Promise<Activities> {
        const { data, error } = await supabaseAdmin
            .from("activities")
            .insert([payload])
            .select()
            .single()
        if (error) throw new Error(error.message)
        return data
    }
}