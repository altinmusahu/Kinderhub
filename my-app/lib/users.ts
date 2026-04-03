import { addUser, getUsers, type User } from "./db";

export async function getRecentUsers(): Promise<User[]> {
  return getUsers();
}

export async function createUser(name: string, email: string, role: string = 'Receptionist'): Promise<User> {
  return addUser({ name, email, role });
}

export type { User } from "./db";