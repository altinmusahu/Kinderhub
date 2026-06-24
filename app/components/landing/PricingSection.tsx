import Link from "next/link"
import { SubscriptionPlanService } from "@/app/api/modules/subscription_plans/subscription_plans.service"
import type { Messages } from "@/lib/i18n"

type PricingProps = {
  t: Messages["pricingSection"]
}

type PlanTranslations = typeof import("@/messages/en.json")["pricingSection"]["plans"]

export default async function PricingSection({ t }: PricingProps) {
  const rawPlans = await SubscriptionPlanService.getAll()
  const activePlans = rawPlans

  const planTranslations = t.plans as unknown as Record<string, PlanTranslations[keyof PlanTranslations]>
  const midIndex = Math.floor(activePlans.length / 2)

  return (
    <section id="pricing" className="bg-[#F3EADA] py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2
            className="text-3xl sm:text-5xl text-[#2A2018] leading-tight"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            {t.title}
          </h2>
          <p className="text-[#5B4D3F] mt-3 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {activePlans.length === 0 ? (
          <p className="text-center text-[#5B4D3F]">No plans available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:items-center">
            {activePlans.map((plan, i) => {
              const planT = planTranslations[plan.code]
              const highlight = i === midIndex

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
                      {t.mostPopular}
                    </span>
                  )}

                  <div className="mb-6">
                    <h3
                      className={`text-2xl mb-1 ${highlight ? "text-[#F3EADA]" : "text-[#2A2018]"}`}
                      style={{ fontFamily: "var(--font-instrument-serif)" }}
                    >
                      {planT?.name ?? plan.Name}
                    </h3>
                    <p className={`text-sm mb-5 leading-relaxed ${highlight ? "text-[#F0A878]" : "text-[#5B4D3F]"}`}>
                      {planT?.description ?? ""}
                    </p>
                    <div className="flex items-end gap-1">
                      <span
                        className={`text-5xl leading-none ${highlight ? "text-[#F3EADA]" : "text-[#2A2018]"}`}
                        style={{ fontFamily: "var(--font-instrument-serif)" }}
                      >
                        ${plan.yearly_price.toFixed(2)}
                      </span>
                      <span
                        className={`text-xs mb-1 ml-1 tracking-wider ${highlight ? "text-[#F0A878]" : "text-[#5B4D3F]"}`}
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      >
                        / {t.perYear}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {(planT?.features ?? []).map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <span className={`mt-0.5 text-base ${highlight ? "text-[#F3B43C]" : "text-[#D2592F]"}`}>✓</span>
                        <span className={highlight ? "text-[#F3EADA]" : "text-[#5B4D3F]"}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/subscribe?planId=${plan.id}`}
                    className={`block text-center font-semibold py-3.5 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      highlight
                        ? "bg-[#F3EADA] text-[#D2592F] hover:bg-white"
                        : "bg-[#D2592F] text-[#F3EADA] hover:bg-[#b8441d]"
                    }`}
                  >
                    {planT?.cta ?? "Get Started"}
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
