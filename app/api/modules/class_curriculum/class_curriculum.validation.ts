import { z } from "zod"

const PERIOD_TYPES = ["week", "month", "term"] as const
const STATUSES = ["draft", "published"] as const

export const createClassCurriculumSchema = z.object({
  class_id: z.string().min(1, "Class is required"),
  tenant_id: z.string().min(1, "Tenant is required"),
  created_by: z.string().min(1, "Creator is required"),
  period_type: z.enum(PERIOD_TYPES),
  period_start: z.string().min(1, "Start date is required"),
  period_end: z.string().min(1, "End date is required"),
  title: z.string().optional().nullable(),
  theme: z.string().optional().nullable(),
  status: z.enum(STATUSES).optional(),
})

export const updateClassCurriculumSchema = z.object({
  period_type: z.enum(PERIOD_TYPES).optional(),
  period_start: z.string().optional(),
  period_end: z.string().optional(),
  title: z.string().optional().nullable(),
  theme: z.string().optional().nullable(),
  status: z.enum(STATUSES).optional(),
})

export type CreateClassCurriculumInput = z.infer<typeof createClassCurriculumSchema>
export type UpdateClassCurriculumInput = z.infer<typeof updateClassCurriculumSchema>
