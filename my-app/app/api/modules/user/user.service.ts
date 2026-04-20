import { UserRepository } from "./user.repository"
import type { CreateUserInput, UpdateUserInput } from "./user.validation"
import type { User } from "./user.types"

export const UserService = {
  async getAll(): Promise<User[]> {
    return UserRepository.findAll()
  },

  async getById(id: string): Promise<User> {
    const user = await UserRepository.findById(id)
    if (!user) throw new Error("User not found")
    return user
  },

  async create(input: CreateUserInput): Promise<User> {
    return UserRepository.create({
      ...input,
      CreatedAt: new Date().toISOString().split("T")[0],
    })
  },

  async update(id: string, input: UpdateUserInput): Promise<User> {
    await UserService.getById(id)
    return UserRepository.update(id, input)
  },

  async delete(id: string): Promise<void> {
    await UserService.getById(id)
    return UserRepository.delete(id)
  },
}
