import { getTranslations, getLocale } from "@/lib/i18n"
import Navbar from "./components/landing/Navbar"
import HeroSection from "./components/landing/HeroSection"
import FeaturesSection from "./components/landing/FeaturesSection"
import PricingSection from "./components/landing/PricingSection"
import CtaBanner from "./components/landing/CtaBanner"
import LandingFooter from "./components/landing/LandingFooter"

export default async function LandingPage() {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()])

  return (
    <div className="min-h-screen bg-[#F3EADA] text-[#2A2018]">
      <Navbar t={t.nav} locale={locale} />
      <HeroSection t={t.hero} stats={Object.values(t.stats)} />
      <FeaturesSection t={t.featuresSection} />
      <PricingSection t={t.pricingSection} />
      <CtaBanner t={t.ctaBanner} />
      <LandingFooter t={t.footer} />
    </div>
  )
}
