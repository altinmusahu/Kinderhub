import { getUsers } from '@/lib/db'

export default async function Page() {
  const users = await getUsers()

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name} — {user.role}</li>
      ))}
    </ul>
  )
}
