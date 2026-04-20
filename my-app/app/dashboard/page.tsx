import { getUsers } from '@/lib/db'
import UsersTable from '../components/UsersTable'

export default async function DashboardPage() {
  const users = await getUsers()
  return (
    <div>
      <UsersTable users={users} />
    </div>
  )
}
