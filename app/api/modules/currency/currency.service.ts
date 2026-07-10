import { CurrencyRepository } from "./currency.repository"
import { Currency } from "./currency.types"
import { CreateCurrencyInput, UpdateCurrencyInput } from "./currency.validation"

export const CurrencyService = {
  async getAll(tenantId: string): Promise<Currency[]> {
    return CurrencyRepository.findAll(tenantId)
  },

  async getById(id: string, tenantId: string): Promise<Currency> {
    const currency = await CurrencyRepository.findById(id, tenantId)
    if (!currency) throw new Error("Currency not found")
    return currency
  },

  async create(input: CreateCurrencyInput): Promise<Currency> {
    return CurrencyRepository.create(input)
  },

  async update(id: string, tenantId: string, input: UpdateCurrencyInput): Promise<Currency> {
    await CurrencyService.getById(id, tenantId)
    return CurrencyRepository.update(id, tenantId, input)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await CurrencyService.getById(id, tenantId)
    return CurrencyRepository.delete(id, tenantId)
  },
}
