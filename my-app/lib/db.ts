import { UserService } from "@/app/api/modules/user/user.service"

const TENANT_ID = "8c0785e5-83cc-4fa3-9957-75ae61b50d37"

export const getUsers = () => UserService.getAll(TENANT_ID)
export const addUser = UserService.create
