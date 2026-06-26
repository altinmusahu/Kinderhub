import type { Metadata } from "next"
import PublicLayout from "@/app/components/landing/PublicLayout"
import FeaturesTabsClient from "@/app/components/landing/FeaturesTabsClient"

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore every feature of Kinderhub — attendance tracking, parent communication, billing, reports, staff management, GDPR security, documents, and calendar. Built for kindergartens.",
  alternates: { canonical: "https://kinderhub.app/features" },
  openGraph: {
    title: "Kinderhub Features — Everything Your Kindergarten Needs",
    description:
      "Attendance, communication, billing, reports, GDPR compliance and more — see exactly how Kinderhub works for your school.",
    url: "https://kinderhub.app/features",
  },
}

export default function FeaturesPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#D2592F] px-4 sm:px-8 py-16 sm:py-24 text-center relative overflow-hidden">
        <div aria-hidden="true" className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#F3EADA]/5" />
        <div aria-hidden="true" className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-[#F3EADA]/5" />
        <span
          className="inline-block text-xs tracking-widest text-[#F0A878] uppercase mb-4"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          Platform Overview
        </span>
        <h1
          className="text-4xl sm:text-6xl text-[#F3EADA] leading-tight max-w-3xl mx-auto"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          Every feature your kindergarten needs
        </h1>
        <p className="text-[#F0A878] mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Kinderhub combines eight powerful modules into one platform. Click any tab below to see exactly what each one does — and watch a walkthrough video when you&#39;re ready.
        </p>
      </section>

      {/* Tabs */}
      <section className="py-16 sm:py-24 bg-[#F3EADA]">
        <FeaturesTabsClient />
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#EBDFC9] py-14 px-4 sm:px-8 text-center">
        <h2
          className="text-3xl sm:text-4xl text-[#2A2018] mb-3"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          Ready to see it in action?
        </h2>
        <p className="text-[#5B4D3F] text-sm sm:text-base mb-7 max-w-md mx-auto">
          Start your free trial — no credit card required. Set up takes under 10 minutes.
        </p>
        <a
          href="/signup"
          className="inline-block bg-[#D2592F] hover:bg-[#b8441d] text-[#F3EADA] font-semibold px-8 py-3.5 rounded-full transition-colors text-sm"
        >
          Start Free Trial →
        </a>
      </section>
    </PublicLayout>
  )
}
