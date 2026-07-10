import { AddressRepository } from "./address.repository"
import { Address } from "./address.types"
import { CreateAddressInput, UpdateAddressInput } from "./address.validation"

export const AddressService = {
  async getById(user_id: string): Promise<Address> {
    const address = await AddressRepository.findById(user_id)
    if (!address) throw new Error("Address not found")
    return address
  },

  async create(input: CreateAddressInput): Promise<Address> {
    return AddressRepository.create(input)
  },

  async update(id: string, input: UpdateAddressInput): Promise<Address> {
    return AddressRepository.update(id, input)
  },

  async delete(id: string): Promise<void> {
    return AddressRepository.delete(id)
  },
}
