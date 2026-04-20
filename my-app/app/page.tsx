import { getUsers } from '@/lib/db'
import UsersTable from './components/UsersTable'

export default async function Page() {
  const users = await getUsers()

  return (
    <div>
      <UsersTable users={users} />
    </div>
  )
}
