import bcrypt from "bcryptjs"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { UserRepository } from "./user.repository"
import { WorkTrackingService } from "../work_tracking/work_tracking.service"
import type { CreateUserInput, UpdateUserInput } from "./user.validation"
import type { User, UserById, UserWithWorkTrackingAndDepartment } from "./user.types"
import { AddressService } from "../address/address.service"

const TENANT_ID = "8c0785e5-83cc-4fa3-9957-75ae61b50d37"

export const UserService = {
  async getAll(tenantId: string): Promise<Omit<User, "password_hash">[]> {
    const users = await UserRepository.findAll(tenantId)
    return users.map(({ password_hash, ...u }) => u)
  },

  async getUsersWithWorkTrackingAndDepartment(tenantId: string): Promise<UserWithWorkTrackingAndDepartment[]> {
    return await UserRepository.findAllWithWorkTrackingAndDepartment(tenantId)
  },

  async getById(id: string, tenantId: string): Promise<UserById> {
    const user = await UserRepository.findById(id, tenantId)
    if (!user) throw new Error("User not found")
    return user
  },

  async findByEmail(email: string): Promise<Omit<User, "password_hash"> | null> {
    const user = await UserRepository.findByEmail(email)
    if (!user) return null
    const { password_hash, ...rest } = user
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

    const { street, house_number, city, postal_code, country ,department_id, position_name, ...userInput } = input

    const user = await UserRepository.createWithId({
      id: authData.user.id,
      ...userInput,
      role_id: null,
      tenant_id: TENANT_ID,
      password_hash,
      is_first_login_executed: false,
      created_at: new Date().toISOString().split("T")[0],
    })

    try {
      await WorkTrackingService.create({
        tenant_id: TENANT_ID,
        user_id: authData.user.id,
        department_id: department_id ?? null,
        position_name: position_name ?? null,
        start_date: new Date().toISOString().split("T")[0],
        end_date: null,
        responsible_user_id: null,
      })
      await AddressService.create({
        street: street ?? null,
        house_number: house_number ?? null,
        city: city ?? null,
        postal_code: postal_code ?? null,
        country: country ?? null,
        user_id: authData.user.id,
      })
    } catch (error) {
      await UserRepository.delete(authData.user.id, TENANT_ID)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw error
    }

    const { password_hash: removedHash, ...rest } = user
    return rest
  },

  async createFromSignup(input: {
    name: string
    lastname: string
    email: string
    password: string
    phone_number: string
    personal_number: string
    date_of_birth: string
    role: string
    is_active: boolean
  }): Promise<Omit<User, "password_hash">> {
    const password_hash = await bcrypt.hash(input.password, 10)

    // Create the Supabase Auth user first
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
    })
    if (authError) throw new Error(authError.message)

    const user = await UserRepository.createWithId({
      id: authData.user.id,
      name: input.name,
      lastname: input.lastname,
      email: input.email,
      password_hash,
      phone_number: input.phone_number,
      personal_number: input.personal_number,
      date_of_birth: input.date_of_birth,
      role: input.role,
      role_id: null,
      is_active: input.is_active,
      tenant_id: TENANT_ID,
      is_first_login_executed: false,
      created_at: new Date().toISOString().split("T")[0],
    })

    const { password_hash: removedHash, ...rest } = user
    return rest
  },

  async update(id: string, tenantId: string, input: UpdateUserInput): Promise<Omit<User, "password_hash">> {
    const existing = await UserService.getById(id, tenantId)
    const { street, house_number, city, postal_code, country, ...userFields } = input

    if (street !== undefined || house_number !== undefined || city !== undefined || postal_code !== undefined || country !== undefined) {
      await AddressService.upsertForUser(id, { street, house_number, city, postal_code, country })
    }

    if (Object.keys(userFields).length === 0) return existing.user

    const user = await UserRepository.update(id, tenantId, userFields)
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
