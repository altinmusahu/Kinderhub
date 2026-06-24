"use client"

import { useRouter } from "next/navigation"
import { setLocale } from "@/app/actions/locale"
import type { Locale } from "@/lib/i18n"

const locales: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "al", label: "AL", flag: "🇦🇱" },
]

export default function LanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter()

  async function handleSwitch(locale: Locale) {
    await setLocale(locale)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
      {locales.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => handleSwitch(code)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
            current === code
              ? "bg-indigo-600 text-white"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
