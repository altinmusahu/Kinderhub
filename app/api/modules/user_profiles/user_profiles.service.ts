import { UserProfilesRepository } from "./user_profiles.repository"
import { UploadProfilePictureInput, UserProfile } from "./user_profiles.types"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

export const UserProfilesService = {
  async getByUser(userId: string): Promise<UserProfile | null> {
    return UserProfilesRepository.findByUser(userId)
  },

  async upload(input: UploadProfilePictureInput): Promise<UserProfile> {
    const { file, user_id } = input

    if (!ALLOWED_TYPES.has(file.type)) {
      throw new Error("File must be a JPEG, PNG, WEBP, or GIF image")
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("Image must be smaller than 5MB")
    }

    const existing = await UserProfilesRepository.findByUser(user_id)

    const storagePath = `${user_id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
    await UserProfilesRepository.uploadFile(storagePath, file)
    const created = await UserProfilesRepository.create({ user_id, file_url: storagePath })

    if (existing) {
      await UserProfilesRepository.delete(existing.id)
      await UserProfilesRepository.removeFile(existing.file_url).catch(() => {})
    }

    return { ...created, file_url: UserProfilesRepository.getPublicUrl(storagePath) }
  },

  async remove(userId: string): Promise<void> {
    const existing = await UserProfilesRepository.findByUser(userId)
    if (!existing) return
    await UserProfilesRepository.delete(existing.id)
    await UserProfilesRepository.removeFile(existing.file_url).catch(() => {})
  },
}
