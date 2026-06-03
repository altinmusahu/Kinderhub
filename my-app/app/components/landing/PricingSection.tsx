import Link from "next/link"
import { SubscriptionPlanService } from "@/app/api/modules/subscription_plans/subscription_plans.service"
import type { Messages } from "@/lib/i18n"

type PricingProps = {
  t: Messages["pricingSection"]
}

type PlanTranslations = typeof import("@/messages/en.json")["pricingSection"]["plans"]

export default async function PricingSection({ t }: PricingProps) {
  const rawPlans = await SubscriptionPlanService.getAll()
  console.log(rawPlans)
  
  const activePlans = rawPlans

  const planTranslations = t.plans as unknown as Record<string, PlanTranslations[keyof PlanTranslations]>
  const midIndex = Math.floor(activePlans.length / 2)

  return (
    <section id="pricing" className="py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-gray-500 mt-3 text-sm sm:text-base max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {activePlans.length === 0 ? (
          <p className="text-center text-gray-400">No plans available.</p>
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
                      ? "bg-indigo-600 border-indigo-600 shadow-xl md:scale-[1.04]"
                      : "bg-white border-gray-200 shadow-sm"
                  }`}
                >
                  {highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      {t.mostPopular}
                    </span>
                  )}

                  <div className="mb-6">
                    <h3 className={`text-lg font-bold mb-1 ${highlight ? "text-white" : "text-gray-900"}`}>
                      {planT?.name ?? plan.Name}
                    </h3>
                    <p className={`text-sm mb-4 ${highlight ? "text-indigo-200" : "text-gray-500"}`}>
                      {planT?.description ?? ""}
                    </p>
                    <div className="flex items-end gap-1">
                      <span className={`text-4xl font-extrabold ${highlight ? "text-white" : "text-gray-900"}`}>
                        ${plan.yearly_price.toFixed(2)}
                      </span>
                      <span className={`text-sm mb-1 ${highlight ? "text-indigo-200" : "text-gray-400"}`}>
                        / {t.perYear}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {(planT?.features ?? []).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <span className={highlight ? "text-indigo-300" : "text-indigo-500"}>✓</span>
                        <span className={highlight ? "text-indigo-100" : "text-gray-600"}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/subscribe?planId=${plan.id}`}
                    className={`block text-center font-semibold py-3 rounded-xl transition-colors ${
                      highlight
                        ? "bg-white text-indigo-600 hover:bg-indigo-50"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
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
