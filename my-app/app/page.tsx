import { getUsers } from '@/lib/db'
import UsersTable from './components/UsersTable'

export default async function Page() {
  const users = await getUsers()

  return (
    <div>
      <h1>Users</h1>
      <UsersTable users={users} />
    </div>
  )
}
