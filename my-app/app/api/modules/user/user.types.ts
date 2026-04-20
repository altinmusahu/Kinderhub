export type User = {
  Id: string
  Name: string
  Lastname: string
  PhoneNumber: string
  PersonalNumber: string
  Role: "Admin" | "User"
  CreatedAt: string
  IsActive: boolean
  DateOfBirth: string
}

export type CreateUserDto = {
  Name: string
  Lastname: string
  PhoneNumber: string
  PersonalNumber: string
  Role: "Admin" | "User"
  CreatedAt: string
  IsActive: boolean
  DateOfBirth: string
}

export type UpdateUserDto = Partial<CreateUserDto>
