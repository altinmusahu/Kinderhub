import HealthCheck from "../components/HealthCheck";
import UserList from "../components/UserList";
import { getRecentUsers } from "../lib/users";
import type { User } from "../lib/db";

export default async function Home() {
  let users: User[] = [];
  try {
    users = await getRecentUsers();
  } catch (error) {
    console.error('Failed to load users:', error);
    // During build or when DB is not available, show empty list
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 rounded-4xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <section className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Backend foundation</p>
          <h1 className="text-4xl font-semibold">Server-first Next.js architecture</h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
            This project now includes server utilities, API route handlers, and a client health-check component. Build your backend logic in `lib/`, keep API route code in `app/api/`, and render pages from server components.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="text-xl font-semibold">Server-side rendered users</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Users are loaded on the server through `lib/users.ts` and rendered during page generation.
              </p>
            </div>
            <UserList users={users} />
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="text-xl font-semibold">API route examples</h2>
              <ul className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <li>
                  <strong>GET</strong> <code>/api/health</code> — backend health and uptime
                </li>
                <li>
                  <strong>GET</strong> <code>/api/users</code> — list users
                </li>
                <li>
                  <strong>POST</strong> <code>/api/users</code> — create a new user
                </li>
              </ul>
            </div>
            <HealthCheck />
          </div>
        </section>
      </main>
    </div>
  );
}
