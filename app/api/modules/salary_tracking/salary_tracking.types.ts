export type SalaryTracking = {
  id: string
  user_id: string
  date: string
  salary: number
  is_active: boolean
  currency_id: string
  symbol: string
}

export type CreateSalaryTrackingDto = Omit<SalaryTracking, "id" | "symbol">

export type UpdateSalaryTrackingDto = Partial<Pick<SalaryTracking, "date" | "salary" | "is_active">>
