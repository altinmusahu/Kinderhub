import type { Messages } from "@/lib/i18n"
import AnimatedCounter from "./AnimatedCounter"

type HeroProps = {
  t: Messages["hero"]
  stats: Array<{ value: string; label: string }>
}

export default function HeroSection({ t, stats }: HeroProps) {
  return (
    <section className="relative overflow-hidden max-w-4xl mx-auto px-4 sm:px-8 pt-8 sm:pt-24 pb-8 sm:pb-20 text-center">

      {/* Decorative gradient orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full bg-linear-to-br from-indigo-100 via-violet-100 to-transparent opacity-60 blur-3xl"
      />

      <span className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both inline-block bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
        {t.badge}
      </span>

      <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-gray-900 mb-6">
        {t.title}{" "}
        <span className="text-indigo-600">{t.titleHighlight}</span>
      </h1>

      <p className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200 fill-mode-both text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-10">
        {t.subtitle}
      </p>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <a
          href="#pricing"
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
        >
          {t.seePlans}
        </a>
        <a
          href="#features"
          className="w-full sm:w-auto text-gray-600 hover:text-indigo-600 font-semibold px-6 py-3 rounded-xl border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 transition-colors text-center"
        >
          {t.learnMore}
        </a>
      </div>

      {/* Stats */}
      <div className="mt-16 sm:mt-20 grid grid-cols-3 gap-4 sm:gap-8 border-t border-gray-100 pt-10 sm:pt-12">
        {stats.map(({ value, label }) => (
          <AnimatedCounter key={label} value={value} label={label} />
        ))}
      </div>
    </section>
  )
}
