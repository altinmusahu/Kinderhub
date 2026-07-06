import { z } from "zod"

export const createClassChecklistItemSchema = z.object({
  class_id: z.string().min(1, "Class is required"),
  tenant_id: z.string().min(1, "Tenant is required"),
  category: z.string().min(1, "Category is required"),
  item_name: z.string().min(1, "Item name is required"),
  is_mandatory: z.boolean(),
  applies_to: z.string().min(1, "Applies-to is required"),
  sort_order: z.number(),
})

export const updateClassChecklistItemSchema = createClassChecklistItemSchema
  .omit({ tenant_id: true, class_id: true })
  .partial()

export type CreateClassChecklistItemInput = z.infer<typeof createClassChecklistItemSchema>
export type UpdateClassChecklistItemInput = z.infer<typeof updateClassChecklistItemSchema>
