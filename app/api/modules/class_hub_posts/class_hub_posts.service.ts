import { ClassHubPostsRepository } from "./class_hub_posts.repository"
import type { ClassHubPostWithAuthor, CreateClassHubPostDto, UpdateClassHubPostDto } from "./class_hub_posts.types"

export const ClassHubPostsService = {
  async getByClassId(tenantId: string, classId: string): Promise<ClassHubPostWithAuthor[]> {
    return ClassHubPostsRepository.findByClassId(tenantId, classId)
  },

  async create(input: CreateClassHubPostDto): Promise<ClassHubPostWithAuthor> {
    return ClassHubPostsRepository.create(input)
  },

  async update(id: string, tenantId: string, authorId: string, input: UpdateClassHubPostDto): Promise<ClassHubPostWithAuthor> {
    return ClassHubPostsRepository.update(id, tenantId, authorId, input)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    return ClassHubPostsRepository.delete(id, tenantId)
  },
}
