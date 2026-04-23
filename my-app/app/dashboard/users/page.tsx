import { getUsers } from "@/lib/db"
import UsersTable from "@/app/components/UsersTable"
import Header from "../components/Header"

export default async function UsersPage() {
  const users = await getUsers()
  return (
    <div className="p-6">
      <Header title="Users" subtitle="Manage your users here" />
      <UsersTable users={users} />
    </div>
  )
}
