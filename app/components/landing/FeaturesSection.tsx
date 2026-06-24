import type { Messages } from "@/lib/i18n"
import { CalendarCheck, MessageCircle, BarChart3, ShieldCheck } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type FeaturesProps = {
  t: Messages["featuresSection"]
}

const FEATURE_ICONS: LucideIcon[] = [CalendarCheck, MessageCircle, BarChart3, ShieldCheck]

const ICON_STYLES = [
  "text-indigo-600 bg-indigo-50",
  "text-violet-600 bg-violet-50",
  "text-blue-600 bg-blue-50",
  "text-emerald-600 bg-emerald-50",
]

const ACCENT_COLORS = [
  "group-hover:bg-indigo-500",
  "group-hover:bg-violet-500",
  "group-hover:bg-blue-500",
  "group-hover:bg-emerald-500",
]

export default function FeaturesSection({ t }: FeaturesProps) {
  const features = Object.values(t.items)

  return (
    <section id="features" className="bg-gray-50 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-gray-500 mt-3 text-sm sm:text-base max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
          {features.map(({ title, desc }, i) => {
            const Icon = FEATURE_ICONS[i]
            const iconStyle = ICON_STYLES[i] ?? "text-indigo-600 bg-indigo-50"
            const accentColor = ACCENT_COLORS[i] ?? "group-hover:bg-indigo-500"

            return (
              <div
                key={title}
                className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              >
                {/* Colored top accent bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${accentColor}`}
                />

                {Icon && (
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${iconStyle}`}>
                    <Icon size={20} />
                  </div>
                )}

                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
