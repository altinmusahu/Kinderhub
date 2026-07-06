export type ClassHubPost = {
  id: string
  class_id: string
  tenant_id: string
  author_id: string
  post_type: string
  body: string
  created_at: string
}

export type ClassHubPostWithAuthor = ClassHubPost & {
  author_name: string | null
}

export type CreateClassHubPostDto = Omit<ClassHubPost, "id" | "created_at">
export type UpdateClassHubPostDto = { body: string }
