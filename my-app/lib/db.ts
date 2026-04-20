import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getUsers() {
  const supabase = createClient(await cookies());

  const { data, error } = await supabase
    .from("User")
    .select("*");

  if (error) {
    console.error(error);
    throw new Error("Failed to fetch users");
  }

  return data;
}