import { z } from "zod"

export const createClassCurriculumItemSchema = z.object({
  curriculum_id: z.string().min(1, "Curriculum is required"),
  tenant_id: z.string().min(1, "Tenant is required"),
  specific_date: z.string().optional().nullable(),
  day_of_week: z.string().optional().nullable(),
  activity_name: z.string().min(1, "Activity name is required"),
  description: z.string().optional().nullable(),
  learning_domain: z.string().optional().nullable(),
  materials_needed: z.string().optional().nullable(),
  sort_order: z.number(),
})

export const updateClassCurriculumItemSchema = createClassCurriculumItemSchema
  .omit({ tenant_id: true, curriculum_id: true })
  .partial()

export type CreateClassCurriculumItemInput = z.infer<typeof createClassCurriculumItemSchema>
export type UpdateClassCurriculumItemInput = z.infer<typeof updateClassCurriculumItemSchema>
