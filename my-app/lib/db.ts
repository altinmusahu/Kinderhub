import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getUsers() {
  const supabase = createClient(await cookies());

  const { data, error } = await supabase
    .from("users")
    .select("*");

  if (error) {
    console.error(error);
    throw new Error("Failed to fetch users");
  }

  return data;
}

export async function addUser(payload: Record<string, unknown>) {
  const supabase = createClient(await cookies());

  const { data, error } = await supabase
    .from("users")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Failed to add user");
  }

  return data;
}