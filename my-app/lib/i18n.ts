import { cookies } from "next/headers"

export type Locale = "en" | "al"
export type Messages = typeof import("../messages/en.json")

export async function getTranslations(): Promise<Messages> {
  const cookieStore = await cookies()
  const locale = (cookieStore.get("locale")?.value ?? "en") as Locale

  if (locale === "al") {
    return (await import("../messages/al.json")).default as Messages
  }
  return (await import("../messages/en.json")).default
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  return (cookieStore.get("locale")?.value ?? "en") as Locale
}
