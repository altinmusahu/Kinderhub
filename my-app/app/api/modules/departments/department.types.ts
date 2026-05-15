export type Department = {
  id: string
  name: string
  is_active: boolean
  tenant_id: string
  location_id: string
}

export type CreateDepartmentDto = {
  name: string
  tenant_id: string
  location_id: string
}

export type UpdateDepartmentDto = Partial<CreateDepartmentDto>
