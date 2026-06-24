import type { Messages } from "@/lib/i18n"
import { CalendarCheck, MessageCircle, BarChart3, ShieldCheck } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type FeaturesProps = {
  t: Messages["featuresSection"]
}

const FEATURE_ICONS: LucideIcon[] = [CalendarCheck, MessageCircle, BarChart3, ShieldCheck]

const ACCENT_COLORS = [
  { bg: "#D2592F", text: "#F3EADA", card: "#F0A878" },
  { bg: "#7FA06A", text: "#F3EADA", card: "#7FA06A" },
  { bg: "#8FB7C9", text: "#2A2018", card: "#8FB7C9" },
  { bg: "#E48F8F", text: "#2A2018", card: "#E48F8F" },
]

export default function FeaturesSection({ t }: FeaturesProps) {
  const features = Object.values(t.items)

  return (
    <section id="features" className="bg-[#EBDFC9] py-16 sm:py-24">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {features.map(({ title, desc }, i) => {
            const Icon = FEATURE_ICONS[i]
            const accent = ACCENT_COLORS[i] ?? ACCENT_COLORS[0]

            return (
              <div
                key={title}
                className="group relative bg-[#F3EADA] rounded-2xl p-7 border border-[#EBDFC9] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              >
                {/* Arch decoration top-right */}
                <div
                  aria-hidden="true"
                  className="absolute -top-10 -right-10 w-28 h-28 rounded-t-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                  style={{ background: accent.bg }}
                />

                {Icon && (
                  <div
                    className="inline-flex items-center justify-center w-11 h-11 rounded-full mb-5"
                    style={{ background: accent.bg }}
                  >
                    <Icon size={20} color={accent.text} />
                  </div>
                )}

                <h3
                  className="text-xl text-[#2A2018] mb-2"
                  style={{ fontFamily: "var(--font-instrument-serif)" }}
                >
                  {title}
                </h3>
                <p className="text-sm text-[#5B4D3F] leading-relaxed">{desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
