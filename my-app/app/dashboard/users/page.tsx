import { getUsers } from "@/lib/db"
import UsersTable from "@/app/components/UsersTable"

export default async function UsersPage() {
  const users = await getUsers()
  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-white/35 text-xs tracking-widest uppercase mb-0.5">Dashboard</p>
        <h1 className="text-lg font-bold text-white">Users</h1>
      </div>
      <UsersTable users={users} />
    </div>
  )
}
