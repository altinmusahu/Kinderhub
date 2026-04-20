import { UserService } from "@/app/api/modules/user/user.service"

export const getUsers = UserService.getAll
export const addUser = UserService.create
