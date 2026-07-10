import { supabaseAdmin } from "@/lib/supabase-admin"
import { CreateUserProfileDto, UserProfile } from "./user_profiles.types"

const STORAGE_BUCKET = "profiles"

export const UserProfilesRepository = {
  async findByUser(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  getPublicUrl(storagePath: string): string {
    const { data } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath)
    return data.publicUrl
  },

  async uploadFile(storagePath: string, file: File): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: true })
    if (error) throw new Error(error.message)
  },

  async removeFile(storagePath: string): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath])
    if (error) throw new Error(error.message)
  },

  async create(payload: CreateUserProfileDto): Promise<UserProfile> {
    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("user_profiles")
      .delete()
      .eq("id", id)
    if (error) throw new Error(error.message)
  },
}
