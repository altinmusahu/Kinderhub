import type { Messages } from "@/lib/i18n"

type HeroProps = {
  t: Messages["hero"]
  stats: Array<{ value: string; label: string }>
}

export default function HeroSection({ t, stats }: HeroProps) {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-8 pt-8 sm:pt-24 pb-8 sm:pb-20 text-center">
      <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
        {t.badge}
      </span>

      <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-gray-900 mb-6">
        {t.title}{" "}
        <span className="text-indigo-600">{t.titleHighlight}</span>
      </h1>

      <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-10">
        {t.subtitle}
      </p>

      {/* <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <a
          href="#pricing"
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-center"
        >
          {t.seePlans}
        </a>
        <a
          href="#features"
          className="w-full sm:w-auto text-gray-600 hover:text-gray-900 font-semibold px-6 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors text-center"
        >
          {t.learnMore}
        </a>
      </div> */}

      {/* Stats */}
      <div className="mt-16 sm:mt-20 grid grid-cols-3 gap-4 sm:gap-8 border-t border-gray-100 pt-10 sm:pt-12">
        {stats.map(({ value, label }) => (
          <div key={label}>
            <p className="text-xl sm:text-3xl font-extrabold text-indigo-600">{value}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
