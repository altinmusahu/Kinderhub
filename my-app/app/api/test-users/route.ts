import { getUsers } from "@/lib/db";

export async function GET() {
  try {
    const users = await getUsers();
    return Response.json(users);
  } catch (err) {
    return Response.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}