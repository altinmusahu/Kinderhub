import { getTranslations, getLocale } from "@/lib/i18n"
import Navbar from "./Navbar"
import LandingFooter from "./LandingFooter"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()])
  return (
    <div className="min-h-screen bg-[#F3EADA] text-[#2A2018] flex flex-col">
      <Navbar t={t.nav} locale={locale} />
      <main className="flex-1">{children}</main>
      <LandingFooter t={t.footer} />
    </div>
  )
}
