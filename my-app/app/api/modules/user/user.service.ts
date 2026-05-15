import bcrypt from "bcryptjs"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { UserRepository } from "./user.repository"
import type { CreateUserInput, UpdateUserInput } from "./user.validation"
import type { User } from "./user.types"

const TENANT_ID = "8c0785e5-83cc-4fa3-9957-75ae61b50d37"

export const UserService = {
  async getAll(tenantId: string): Promise<Omit<User, "password_hash">[]> {
    const users = await UserRepository.findAll(tenantId)
    return users.map(({ password_hash: _, ...u }) => u)
  },

  async getById(id: string, tenantId: string): Promise<Omit<User, "password_hash">> {
    const user = await UserRepository.findById(id, tenantId)
    if (!user) throw new Error("User not found")
    const { password_hash: _, ...rest } = user
    return rest
  },

  async create(input: CreateUserInput): Promise<Omit<User, "password_hash">> {
    const plainPassword = `${input.name}${input.lastname}`
    const password_hash = await bcrypt.hash(plainPassword, 10)

    // Create the Supabase Auth user first
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: plainPassword,
      email_confirm: true,
    })
    if (authError) throw new Error(authError.message)

    const user = await UserRepository.createWithId({
      id: authData.user.id,
      ...input,
      tenant_id: TENANT_ID,
      password_hash,
      is_first_login_executed: false,
      created_at: new Date().toISOString().split("T")[0],
    })

    const { password_hash: _, ...rest } = user
    return rest
  },

  async update(id: string, tenantId: string, input: UpdateUserInput): Promise<Omit<User, "password_hash">> {
    await UserService.getById(id, tenantId)
    const user = await UserRepository.update(id, tenantId, input)
    const { password_hash: _, ...rest } = user
    return rest
  },

  async changePassword(id: string, tenantId: string, newPassword: string): Promise<void> {
    const password_hash = await bcrypt.hash(newPassword, 10)
    await UserRepository.update(id, tenantId, {
      password_hash,
      is_first_login_executed: true,
    })
    // Also update in Supabase Auth
    await supabaseAdmin.auth.admin.updateUserById(id, { password: newPassword })
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await UserService.getById(id, tenantId)
    await UserRepository.delete(id, tenantId)
    await supabaseAdmin.auth.admin.deleteUser(id)
  },
}
