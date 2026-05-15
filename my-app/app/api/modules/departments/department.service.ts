import { DepartmentRepository } from "./department.repository"
import { CreateDepartmentDto, Department } from "./department.types"
import { UpdateDepartmentInput } from "./department.validation"

export const DepartmentService = {
  async getAll(tenantId: string): Promise<Department[]> {
    return DepartmentRepository.findAll(tenantId)
  },

  async getById(id: string, tenantId: string): Promise<Department> {
    const dept = await DepartmentRepository.findById(id, tenantId)
    if (!dept) throw new Error("Department not found")
    return dept
  },

  async create(input: CreateDepartmentDto): Promise<Department> {
    return DepartmentRepository.create(input)
  },

  async update(id: string, tenantId: string, input: UpdateDepartmentInput): Promise<Department> {
    await DepartmentService.getById(id, tenantId)
    return DepartmentRepository.update(id, tenantId, input)
  },

  async delete(id: string, tenantId: string): Promise<void> {
    await DepartmentService.getById(id, tenantId)
    return DepartmentRepository.delete(id, tenantId)
  },
}
