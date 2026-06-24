import type { Messages } from "@/lib/i18n"

type CtaBannerProps = {
  t: Messages["ctaBanner"]
}

export default function CtaBanner({ t }: CtaBannerProps) {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-700 py-14 sm:py-20 text-center px-4">

      {/* Decorative orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 w-64 h-64 rounded-full bg-violet-500 opacity-20 blur-3xl -translate-y-1/2 translate-x-1/4"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 w-48 h-48 rounded-full bg-indigo-400 opacity-20 blur-2xl translate-y-1/2 -translate-x-1/4"
      />

      <div className="relative z-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t.title}</h2>
        <p className="text-indigo-200 mb-8 text-sm sm:text-base max-w-md mx-auto">{t.subtitle}</p>
        <a
          href="#pricing"
          className="inline-block bg-white text-indigo-600 font-semibold px-8 py-3 rounded-xl hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm hover:shadow-md"
        >
          {t.button}
        </a>
      </div>
    </section>
  )
}
