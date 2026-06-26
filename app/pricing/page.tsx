import type { Metadata } from "next"
import Link from "next/link"
import { Fragment } from "react"
import { Check, Minus } from "lucide-react"
import PublicLayout from "@/app/components/landing/PublicLayout"
import { SubscriptionPlanService } from "@/app/api/modules/subscription_plans/subscription_plans.service"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Kinderhub. Starter from $29/mo, Growth from $79/mo, Enterprise custom. All plans include every module — no add-ons, no hidden fees.",
  alternates: { canonical: "https://kinderhub.app/pricing" },
  openGraph: {
    title: "Kinderhub Pricing — Simple Plans for Every Kindergarten",
    description:
      "Starter, Growth, and Enterprise plans. All include attendance, communication, billing, reports and more. Start free.",
    url: "https://kinderhub.app/pricing",
  },
}

const COMPARISON_ROWS: {
  category: string
  features: { label: string; starter: boolean | string; growth: boolean | string; enterprise: boolean | string }[]
}[] = [
  {
    category: "Children & Capacity",
    features: [
      { label: "Children managed", starter: "Up to 30", growth: "Up to 150", enterprise: "Unlimited" },
      { label: "Multiple locations", starter: false, growth: false, enterprise: true },
    ],
  },
  {
    category: "Attendance",
    features: [
      { label: "Daily attendance tracking", starter: true, growth: true, enterprise: true },
      { label: "Absence notifications to parents", starter: true, growth: true, enterprise: true },
      { label: "Exportable attendance reports", starter: false, growth: true, enterprise: true },
    ],
  },
  {
    category: "Communication",
    features: [
      { label: "Parent messaging", starter: true, growth: true, enterprise: true },
      { label: "Group / class announcements", starter: false, growth: true, enterprise: true },
      { label: "Photo & document sharing", starter: false, growth: true, enterprise: true },
    ],
  },
  {
    category: "Billing",
    features: [
      { label: "Invoice generation", starter: true, growth: true, enterprise: true },
      { label: "Payment reminders", starter: false, growth: true, enterprise: true },
      { label: "Revenue reports", starter: false, growth: true, enterprise: true },
    ],
  },
  {
    category: "Staff & Admin",
    features: [
      { label: "Staff accounts", starter: "1 account", growth: "10 accounts", enterprise: "Unlimited" },
      { label: "Role-based access control", starter: false, growth: true, enterprise: true },
      { label: "Custom branding", starter: false, growth: false, enterprise: true },
      { label: "API access", starter: false, growth: false, enterprise: true },
    ],
  },
  {
    category: "Reports & Data",
    features: [
      { label: "Basic dashboard", starter: true, growth: true, enterprise: true },
      { label: "Advanced analytics", starter: false, growth: true, enterprise: true },
      { label: "CSV / PDF export", starter: false, growth: true, enterprise: true },
    ],
  },
  {
    category: "Support",
    features: [
      { label: "Email support", starter: true, growth: true, enterprise: true },
      { label: "Priority support", starter: false, growth: true, enterprise: true },
      { label: "Dedicated account manager", starter: false, growth: false, enterprise: true },
      { label: "SLA guarantee", starter: false, growth: false, enterprise: true },
    ],
  },
]

const pricingJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Kinderhub Pricing Plans",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Offer",
        name: "Starter",
        description: "Perfect for small kindergartens just getting started.",
        price: "29",
        priceCurrency: "USD",
        priceSpecification: { "@type": "UnitPriceSpecification", billingDuration: "P1M" },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Offer",
        name: "Growth",
        description: "For growing schools that need more power and flexibility.",
        price: "79",
        priceCurrency: "USD",
        priceSpecification: { "@type": "UnitPriceSpecification", billingDuration: "P1M" },
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Offer",
        name: "Enterprise",
        description: "For large schools or groups with multiple locations.",
        price: "Custom",
        priceCurrency: "USD",
      },
    },
  ],
}

export default async function PricingPage() {
  const plans = await SubscriptionPlanService.getAll()

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[#F3EADA] px-4 sm:px-8 py-16 sm:py-20 text-center">
        <span
          className="inline-block text-xs tracking-widest text-[#D2592F] uppercase mb-4"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          Pricing
        </span>
        <h1
          className="text-4xl sm:text-6xl text-[#2A2018] leading-tight max-w-3xl mx-auto"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          Simple, transparent pricing
        </h1>
        <p className="text-[#5B4D3F] mt-4 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
          No hidden fees. No module add-ons. Cancel any time. Every plan includes the full platform.
        </p>
      </section>

      {/* Plan cards */}
      <section className="bg-[#F3EADA] pb-16 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          {plans.length === 0 ? (
            <p className="text-center text-[#5B4D3F]">Plans loading…</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:items-center">
              {plans.map((plan, i) => {
                const mid = Math.floor(plans.length / 2)
                const highlight = i === mid
                const names = ["Starter", "Growth", "Enterprise"]
                const descs = [
                  "Perfect for small kindergartens just getting started.",
                  "For growing schools that need more power and flexibility.",
                  "For large schools or groups with multiple locations.",
                ]
                const ctas = ["Get Started", "Start Free Trial", "Contact Sales"]

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl border p-7 sm:p-8 flex flex-col ${
                      highlight
                        ? "bg-[#D2592F] border-[#D2592F] shadow-xl md:scale-[1.04]"
                        : "bg-[#EBDFC9] border-[#EBDFC9] shadow-sm"
                    }`}
                  >
                    {highlight && (
                      <span
                        className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F3B43C] text-[#2A2018] text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap"
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      >
                        Most Popular
                      </span>
                    )}
                    <div className="mb-6">
                      <h2
                        className={`text-2xl mb-1 ${highlight ? "text-[#F3EADA]" : "text-[#2A2018]"}`}
                        style={{ fontFamily: "var(--font-instrument-serif)" }}
                      >
                        {names[i] ?? plan.Name}
                      </h2>
                      <p className={`text-sm mb-5 leading-relaxed ${highlight ? "text-[#F0A878]" : "text-[#5B4D3F]"}`}>
                        {descs[i] ?? ""}
                      </p>
                      <div className="flex items-end gap-1">
                        <span
                          className={`text-5xl leading-none ${highlight ? "text-[#F3EADA]" : "text-[#2A2018]"}`}
                          style={{ fontFamily: "var(--font-instrument-serif)" }}
                        >
                          ${plan.yearly_price.toFixed(0)}
                        </span>
                        <span
                          className={`text-xs mb-1 ml-1 tracking-wider ${highlight ? "text-[#F0A878]" : "text-[#5B4D3F]"}`}
                          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                        >
                          / year
                        </span>
                      </div>
                    </div>

                    <Link
                      href={i === 2 ? "/contact" : `/subscribe?planId=${plan.id}`}
                      className={`block text-center font-semibold py-3.5 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] mt-auto ${
                        highlight
                          ? "bg-[#F3EADA] text-[#D2592F] hover:bg-white"
                          : "bg-[#D2592F] text-[#F3EADA] hover:bg-[#b8441d]"
                      }`}
                    >
                      {ctas[i] ?? "Get Started"}
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-[#EBDFC9] py-16 sm:py-24 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl text-[#2A2018] text-center mb-3"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            Compare plans
          </h2>
          <p className="text-[#5B4D3F] text-center text-sm mb-10">
            Full feature breakdown — so you can pick the right plan with confidence.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-[#EBDFC9] shadow-sm bg-[#F3EADA]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EBDFC9]">
                  <th className="text-left px-5 py-4 text-[#2A2018] font-semibold w-1/2">Feature</th>
                  <th className="px-4 py-4 text-center text-[#5B4D3F] font-semibold">Starter</th>
                  <th className="px-4 py-4 text-center bg-[#D2592F]/8 text-[#D2592F] font-bold">Growth</th>
                  <th className="px-4 py-4 text-center text-[#5B4D3F] font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map(({ category, features }) => (
                  <Fragment key={category}>
                    <tr className="border-t border-[#EBDFC9] bg-[#EBDFC9]/60">
                      <td
                        colSpan={4}
                        className="px-5 py-2 text-xs font-bold tracking-widest uppercase text-[#5B4D3F]"
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      >
                        {category}
                      </td>
                    </tr>
                    {features.map(({ label, starter, growth, enterprise }) => (
                      <tr key={label} className="border-t border-[#EBDFC9] hover:bg-[#EBDFC9]/30 transition-colors">
                        <td className="px-5 py-3 text-[#5B4D3F]">{label}</td>
                        <td className="px-4 py-3 text-center">
                          {typeof starter === "string" ? (
                            <span className="text-[#2A2018] font-medium">{starter}</span>
                          ) : starter ? (
                            <Check size={16} className="mx-auto text-[#7FA06A]" />
                          ) : (
                            <Minus size={16} className="mx-auto text-[#C4B9AA]" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center bg-[#D2592F]/5">
                          {typeof growth === "string" ? (
                            <span className="text-[#2A2018] font-medium">{growth}</span>
                          ) : growth ? (
                            <Check size={16} className="mx-auto text-[#D2592F]" />
                          ) : (
                            <Minus size={16} className="mx-auto text-[#C4B9AA]" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {typeof enterprise === "string" ? (
                            <span className="text-[#2A2018] font-medium">{enterprise}</span>
                          ) : enterprise ? (
                            <Check size={16} className="mx-auto text-[#7FA06A]" />
                          ) : (
                            <Minus size={16} className="mx-auto text-[#C4B9AA]" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="bg-[#F3EADA] py-12 px-4 sm:px-8 text-center">
        <p className="text-[#5B4D3F] text-sm mb-2">Still have questions about pricing?</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/faq" className="text-sm font-semibold text-[#D2592F] hover:text-[#b8441d] transition-colors">
            Read the FAQ →
          </Link>
          <span className="text-[#C4B9AA]">·</span>
          <Link href="/contact" className="text-sm font-semibold text-[#D2592F] hover:text-[#b8441d] transition-colors">
            Contact us →
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
