import { z } from "zod"

export const createFoodSupplyItemSchema = z.object({
  item_name: z.string().min(1, "Item name is required"),
  quantity: z.coerce.number().nullable().optional().default(null),
  unit: z.string().nullable().optional().default(null),
  unit_cost: z.coerce.number().nullable().optional().default(null),
  line_total: z.coerce.number(),
})

export const createFoodSupplySchema = z.object({
  location_id: z.string().uuid("Invalid location"),
  vendor_name: z.string().nullable().optional().default(null),
  purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Purchase date must be YYYY-MM-DD"),
  total_cost: z.coerce.number().positive("Total cost must be greater than 0"),
  items: z.array(createFoodSupplyItemSchema).min(1, "Add at least one item"),
})

export type CreateFoodSupplyItemInput = z.infer<typeof createFoodSupplyItemSchema>
export type CreateFoodSupplyInput = z.infer<typeof createFoodSupplySchema>
