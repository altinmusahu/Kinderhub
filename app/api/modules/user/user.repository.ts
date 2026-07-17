import { supabaseAdmin } from "@/lib/supabase-admin"
import type { User, CreateUserDto, UpdateUserDto, UserWithWorkTrackingAndDepartment, UserById } from "./user.types"

export const UserRepository = {
  // GET
  async findAll(tenantId: string): Promise<User[]> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
    if (error) throw new Error(error.message)
    return data
  },

  async findById(id: string, tenantId: string): Promise<UserById | null> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select(`
        *,
        tenants (
          name
        ),
        work_tracking!work_tracking_user_id_fkey (
          position_name,
          end_date,
          department_id,
          responsible_user_id,
          start_date,
          department:departments (
            name
          )
        ),
        salary_tracking!salary_tracking_user_id_fkey (
          id,
          user_id,
          date,
          salary,
          is_active,
          currency_id,
          currency (
            symbol
          )
        ),
        address (
          id,
          street,
          house_number,
          city,
          postal_code,
          country,
          created_at,
          user_id
        )
      `)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle()

    if (error) throw new Error(error.message)

    if (!data) return null

    // Pick the active work_tracking record (end_date is null), fall back to most recent
    const activeWt = data.work_tracking?.find((wt: any) => wt.end_date === null) ?? data.work_tracking?.[0] ?? null
    const activeSalaryRaw = data.salary_tracking?.find((st: { is_active: boolean }) => st.is_active) ?? data.salary_tracking?.[0] ?? null
    const activeSalary = activeSalaryRaw
      ? { ...activeSalaryRaw, symbol: activeSalaryRaw.currency?.symbol }
      : null
    const address = Array.isArray(data.address) ? data.address[0] ?? null : data.address ?? null

    return {
      user: {
        id: data.id,
        name: data.name,
        lastname: data.lastname,
        phone_number: data.phone_number,
        personal_number: data.personal_number,
        role: data.role,
        role_id: data.role_id ?? null,
        created_at: data.created_at,
        is_active: data.is_active,
        date_of_birth: data.date_of_birth,
        tenant_id: data.tenant_id,
        email: data.email,
        is_first_login_executed: data.is_first_login_executed,
      },
      position_name: activeWt?.position_name ?? null,
      tenant_name: data.tenants?.name ?? null,
      department_name: activeWt?.department?.name ?? null,
      responsible_user_id: activeWt?.responsible_user_id ?? null,
      responsible_user_name: null,
      start_date: activeWt?.start_date ?? null,
      salary: activeSalary,
      address,
    }
  },

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async findAllWithWorkTrackingAndDepartment(tenantId: string): Promise<UserWithWorkTrackingAndDepartment[]> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select(`
        id,
        name,
        lastname,
        phone_number,
        created_at,
        is_active,
        date_of_birth,
        email,
        work_tracking!work_tracking_user_id_fkey (
          department_id,
          end_date,
          department:departments (
            name
          ),
          position_name
        ),
        user_profiles (
          file_url,
          created_at
        ),
        salary_tracking!salary_tracking_user_id_fkey (
          salary,
          is_active,
          currency:currency_id ( symbol )
        )
      `)
      .eq("tenant_id", tenantId)

    if (error) throw new Error(error.message)

    return (data ?? []).map((u) => {
      // Pick active record (end_date null), fall back to most recent
      const wt = (u.work_tracking ?? []).find((r: any) => r.end_date === null)
             ?? u.work_tracking?.[0]
             ?? null
      // PostgREST returns the joined department as object or array depending on cardinality
      const dept = Array.isArray(wt?.department) ? wt.department[0] : wt?.department

      // A user should have at most one profile picture; fall back to most recent if duplicates slipped in
      const profiles = u.user_profiles ?? []
      const latestProfile = profiles.length > 1
        ? [...profiles].sort((a: any, b: any) => b.created_at.localeCompare(a.created_at))[0]
        : profiles[0] ?? null
      const profile_picture_url = latestProfile
        ? supabaseAdmin.storage.from("profiles").getPublicUrl(latestProfile.file_url).data.publicUrl
        : null

      const activeSalary = (u.salary_tracking ?? []).find((s: any) => s.is_active) ?? null
      const salaryCurrency = Array.isArray(activeSalary?.currency) ? activeSalary.currency[0] : activeSalary?.currency

      return {
        id: u.id,
        name: u.name,
        lastname: u.lastname,
        phone_number: u.phone_number,
        created_at: u.created_at,
        is_active: u.is_active,
        profile_picture_url,
        date_of_birth: u.date_of_birth,
        email: u.email,
        department_id: wt?.department_id ?? null,
        department_name: dept?.name ?? null,
        position_name: wt?.position_name ?? null,
        salary: activeSalary?.salary ?? null,
        salary_symbol: salaryCurrency?.symbol ?? null,
      }
    })
  },

  // POST
  async create(payload: CreateUserDto): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async createWithId(payload: User): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  // PUT
  async update(id: string, tenantId: string, payload: UpdateUserDto): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .update(payload)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  // DELETE
  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}