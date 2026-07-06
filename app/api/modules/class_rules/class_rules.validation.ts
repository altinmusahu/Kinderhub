import { z } from "zod"

export const createClassRuleSchema = z.object({
  class_id: z.string().min(1, "Class is required"),
  tenant_id: z.string().min(1, "Tenant is required"),
  rule_text: z.string().min(1, "Rule text is required"),
  sort_order: z.number(),
})

export type CreateClassRuleInput = z.infer<typeof createClassRuleSchema>
