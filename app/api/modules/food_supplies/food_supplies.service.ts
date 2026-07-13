import { FoodSuppliesRepository } from "./food_supplies.repository"
import { FoodSupplyWithDetails, FoodSupplyWithItems, UploadFoodSupplyInput } from "./food_supplies.types"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"])

export const FoodSuppliesService = {
  async getAllForTenant(tenantId: string): Promise<FoodSupplyWithDetails[]> {
    return FoodSuppliesRepository.findAllForTenant(tenantId)
  },

  async getById(id: string, tenantId: string): Promise<FoodSupplyWithItems> {
    const supply = await FoodSuppliesRepository.findById(id, tenantId)
    if (!supply) throw new Error("Food supply not found")
    return supply
  },

  async upload(input: UploadFoodSupplyInput): Promise<FoodSupplyWithItems> {
    const { file, tenant_id, created_by, location_id, vendor_name, purchase_date, total_cost, items } = input

    let storagePath: string | null = null
    if (file) {
      if (!ALLOWED_TYPES.has(file.type)) {
        throw new Error("File must be a JPEG, PNG, WEBP, HEIC, or PDF")
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("Receipt photo must be smaller than 10MB")
      }
      storagePath = `${tenant_id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
      await FoodSuppliesRepository.uploadFile(storagePath, file)
    }

    try {
      const created = await FoodSuppliesRepository.create({
        tenant_id,
        location_id,
        vendor_name,
        purchase_date,
        total_cost,
        receipt_storage_path: storagePath,
        created_by,
      })

      try {
        await FoodSuppliesRepository.createItems(created.id, items)
      } catch (err) {
        await FoodSuppliesRepository.delete(created.id, tenant_id).catch(() => {})
        throw err
      }

      return FoodSuppliesService.getById(created.id, tenant_id)
    } catch (err) {
      if (storagePath) await FoodSuppliesRepository.removeFile(storagePath).catch(() => {})
      throw err
    }
  },

  async delete(id: string, tenantId: string): Promise<void> {
    const supply = await FoodSuppliesService.getById(id, tenantId)
    await FoodSuppliesRepository.deleteItemsForSupply(id)
    await FoodSuppliesRepository.delete(id, tenantId)
    if (supply.receipt_storage_path) await FoodSuppliesRepository.removeFile(supply.receipt_storage_path).catch(() => {})
  },
}
