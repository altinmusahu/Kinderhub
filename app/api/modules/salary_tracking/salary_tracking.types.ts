export type SalaryTracking = {
  id: string
  user_id: string
  date: string
  salary: number
  is_active: boolean
}

export type CreateSalaryTrackingDto = Omit<SalaryTracking, "id">

export type UpdateSalaryTrackingDto = Partial<Pick<SalaryTracking, "date" | "salary" | "is_active">>
