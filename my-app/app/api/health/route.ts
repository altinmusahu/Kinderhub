import { getHealth } from "../../../lib/db";

export async function GET() {
  const health = getHealth();
  return new Response(JSON.stringify(health), {
    headers: { "Content-Type": "application/json" },
  });
}
