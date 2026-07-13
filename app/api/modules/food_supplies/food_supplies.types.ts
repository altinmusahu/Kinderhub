export type FoodSupply = {
  id: string
  tenant_id: string
  location_id: string
  vendor_name: string | null
  purchase_date: string
  total_cost: number
  receipt_storage_path: string | null
  created_by: string
  created_at: string
}

export type FoodSupplyItem = {
  id: string
  supply_id: string
  item_name: string
  quantity: number | null
  unit: string | null
  unit_cost: number | null
  line_total: number
}

export type FoodSupplyWithDetails = FoodSupply & {
  location_name: string | null
  created_by_name: string | null
  receipt_url: string | null
  items_count: number
}

export type FoodSupplyWithItems = FoodSupplyWithDetails & {
  items: FoodSupplyItem[]
}

export type CreateFoodSupplyItemDto = {
  item_name: string
  quantity: number | null
  unit: string | null
  unit_cost: number | null
  line_total: number
}

export type CreateFoodSupplyDto = {
  tenant_id: string
  location_id: string
  vendor_name: string | null
  purchase_date: string
  total_cost: number
  receipt_storage_path: string | null
  created_by: string
}

export type UploadFoodSupplyInput = {
  file: File | null
  tenant_id: string
  created_by: string
  location_id: string
  vendor_name: string | null
  purchase_date: string
  total_cost: number
  items: CreateFoodSupplyItemDto[]
}
