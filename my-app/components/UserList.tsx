import type { User } from "../lib/db";

export default function UserList({ users }: { users: User[] }) {
  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <div key={user.id} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">{user.created_at}</p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-950 dark:text-zinc-50">{user.name}</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{user.email}</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">{user.role}</p>
        </div>
      ))}
    </div>
  );
}
