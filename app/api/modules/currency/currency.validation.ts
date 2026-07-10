import { z } from "zod"

export const createCurrencySchema = z.object({
  currency: z.string().min(1, "Currency is required"),
  tenant_id: z.string().min(1, "tenant is required"),
  symbol: z.string().min(1, "Symbol is required"),
})

export const updateCurrencySchema = createCurrencySchema.partial()

export type CreateCurrencyInput = z.infer<typeof createCurrencySchema>
export type UpdateCurrencyInput = z.infer<typeof updateCurrencySchema>
