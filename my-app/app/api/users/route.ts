import { createUser, getRecentUsers } from "../../../lib/users";

export async function GET() {
  const users = await getRecentUsers();
  return new Response(JSON.stringify(users), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, role } = body;

  if (!name || !email) {
    return new Response(JSON.stringify({ error: "Missing name or email" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await createUser(name, email, role);
  return new Response(JSON.stringify(user), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
