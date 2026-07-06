import { supabaseAdmin } from "@/lib/supabase-admin"
import type { ClassHubPostWithAuthor, CreateClassHubPostDto, UpdateClassHubPostDto } from "./class_hub_posts.types"

export const ClassHubPostsRepository = {
  async findByClassId(tenantId: string, classId: string): Promise<ClassHubPostWithAuthor[]> {
    const { data, error } = await supabaseAdmin
      .from("class_hub_posts")
      .select("*, users ( name, lastname )")
      .eq("tenant_id", tenantId)
      .eq("class_id", classId)
      .order("created_at", { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map((row) => {
      const author = Array.isArray(row.users) ? row.users[0] : row.users
      return {
        id: row.id,
        class_id: row.class_id,
        tenant_id: row.tenant_id,
        author_id: row.author_id,
        post_type: row.post_type,
        body: row.body,
        created_at: row.created_at,
        author_name: author ? `${author.name} ${author.lastname}` : null,
      }
    })
  },

  async create(payload: CreateClassHubPostDto): Promise<ClassHubPostWithAuthor> {
    const { data, error } = await supabaseAdmin
      .from("class_hub_posts")
      .insert([payload])
      .select("*, users ( name, lastname )")
      .single()
    if (error) throw new Error(error.message)
    const author = Array.isArray(data.users) ? data.users[0] : data.users
    return {
      id: data.id,
      class_id: data.class_id,
      tenant_id: data.tenant_id,
      author_id: data.author_id,
      post_type: data.post_type,
      body: data.body,
      created_at: data.created_at,
      author_name: author ? `${author.name} ${author.lastname}` : null,
    }
  },

  async update(id: string, tenantId: string, authorId: string, payload: UpdateClassHubPostDto): Promise<ClassHubPostWithAuthor> {
    const { data, error } = await supabaseAdmin
      .from("class_hub_posts")
      .update(payload)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .eq("author_id", authorId)
      .select("*, users ( name, lastname )")
      .single()
    if (error) throw new Error(error.message)
    const author = Array.isArray(data.users) ? data.users[0] : data.users
    return {
      id: data.id,
      class_id: data.class_id,
      tenant_id: data.tenant_id,
      author_id: data.author_id,
      post_type: data.post_type,
      body: data.body,
      created_at: data.created_at,
      author_name: author ? `${author.name} ${author.lastname}` : null,
    }
  },

  async delete(id: string, tenantId: string, authorId: string): Promise<void> {
    const { data, error } = await supabaseAdmin
      .from("class_hub_posts")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .eq("author_id", authorId)
      .select("id")
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) throw new Error("Post not found or not owned by this user")
  },
}
