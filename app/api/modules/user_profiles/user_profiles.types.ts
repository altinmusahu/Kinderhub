export type UserProfile = {
  id: string
  user_id: string
  file_url: string
  created_at: string
}

export type CreateUserProfileDto = Omit<UserProfile, "id" | "created_at">

export type UploadProfilePictureInput = {
  file: File
  user_id: string
}
