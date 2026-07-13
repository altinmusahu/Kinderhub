import { supabaseAdmin } from "@/lib/supabase-admin"
import {
  CreateFoodSupplyDto,
  CreateFoodSupplyItemDto,
  FoodSupply,
  FoodSupplyItem,
  FoodSupplyWithDetails,
  FoodSupplyWithItems,
} from "./food_supplies.types"

// Signed URLs expire in 7 days (604800 seconds)
const SIGNED_URL_TTL = 60 * 60 * 24 * 7
const STORAGE_BUCKET = "receipt"

export const FoodSuppliesRepository = {
  async findAllForTenant(tenantId: string): Promise<FoodSupplyWithDetails[]> {
    const { data, error } = await supabaseAdmin
      .from("food_supplies")
      .select(`
        *,
        locations ( name ),
        users ( name, lastname )
      `)
      .eq("tenant_id", tenantId)
      .order("purchase_date", { ascending: false })
    if (error) throw new Error(error.message)

    const supplies = data ?? []
    if (supplies.length === 0) return []

    const supplyIds = supplies.map((s) => s.id)
    const { data: itemRows, error: itemsError } = await supabaseAdmin
      .from("food_supply_items")
      .select("supply_id")
      .in("supply_id", supplyIds)
    if (itemsError) throw new Error(itemsError.message)

    const itemCounts = new Map<string, number>()
    for (const row of itemRows ?? []) {
      itemCounts.set(row.supply_id, (itemCounts.get(row.supply_id) ?? 0) + 1)
    }

    const receiptPaths = supplies.map((s) => s.receipt_storage_path).filter((p): p is string => p !== null)
    const signedUrlByPath = new Map(
      (await this.createSignedUrls(receiptPaths)).map((url, i) => [receiptPaths[i], url])
    )

    return supplies.map((row, i) => ({
      id: row.id,
      tenant_id: row.tenant_id,
      location_id: row.location_id,
      vendor_name: row.vendor_name,
      purchase_date: row.purchase_date,
      total_cost: row.total_cost,
      receipt_storage_path: row.receipt_storage_path,
      created_by: row.created_by,
      created_at: row.created_at,
      location_name: row.locations?.name ?? null,
      created_by_name: row.users ? `${row.users.name} ${row.users.lastname}` : null,
      receipt_url: row.receipt_storage_path ? (signedUrlByPath.get(row.receipt_storage_path) ?? null) : null,
      items_count: itemCounts.get(row.id) ?? 0,
    }))
  },

  async findById(id: string, tenantId: string): Promise<FoodSupplyWithItems | null> {
    const { data, error } = await supabaseAdmin
      .from("food_supplies")
      .select(`
        *,
        locations ( name ),
        users ( name, lastname )
      `)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return null

    const { data: items, error: itemsError } = await supabaseAdmin
      .from("food_supply_items")
      .select("*")
      .eq("supply_id", id)
    if (itemsError) throw new Error(itemsError.message)

    const receiptUrl = data.receipt_storage_path ? await this.createSignedUrl(data.receipt_storage_path) : null

    return {
      id: data.id,
      tenant_id: data.tenant_id,
      location_id: data.location_id,
      vendor_name: data.vendor_name,
      purchase_date: data.purchase_date,
      total_cost: data.total_cost,
      receipt_storage_path: data.receipt_storage_path,
      created_by: data.created_by,
      created_at: data.created_at,
      location_name: data.locations?.name ?? null,
      created_by_name: data.users ? `${data.users.name} ${data.users.lastname}` : null,
      receipt_url: receiptUrl,
      items_count: (items ?? []).length,
      items: items ?? [],
    }
  },

  async createSignedUrl(storagePath: string): Promise<string> {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_TTL)
    if (error) throw new Error(error.message)
    return data.signedUrl
  },

  async createSignedUrls(storagePaths: string[]): Promise<(string | null)[]> {
    if (storagePaths.length === 0) return []
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrls(storagePaths, SIGNED_URL_TTL)
    if (error) throw new Error(error.message)
    return (data ?? []).map((d) => d.signedUrl ?? null)
  },

  async uploadFile(storagePath: string, file: File): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: false })
    if (error) throw new Error(error.message)
  },

  async removeFile(storagePath: string): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath])
    if (error) throw new Error(error.message)
  },

  async create(payload: CreateFoodSupplyDto): Promise<FoodSupply> {
    const { data, error } = await supabaseAdmin
      .from("food_supplies")
      .insert([payload])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async createItems(supplyId: string, items: CreateFoodSupplyItemDto[]): Promise<FoodSupplyItem[]> {
    const payload = items.map((item) => ({ ...item, supply_id: supplyId }))
    const { data, error } = await supabaseAdmin
      .from("food_supply_items")
      .insert(payload)
      .select()
    if (error) throw new Error(error.message)
    return data ?? []
  },

  async deleteItemsForSupply(supplyId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("food_supply_items")
      .delete()
      .eq("supply_id", supplyId)
    if (error) throw new Error(error.message)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("food_supplies")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
    if (error) throw new Error(error.message)
  },
}
