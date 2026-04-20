import type { Messages } from "@/lib/i18n"

type CtaBannerProps = {
  t: Messages["ctaBanner"]
}

export default function CtaBanner({ t }: CtaBannerProps) {
  return (
    <section className="bg-indigo-600 py-14 sm:py-20 text-center px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t.title}</h2>
      <p className="text-indigo-200 mb-8 text-sm sm:text-base max-w-md mx-auto">{t.subtitle}</p>
      <a
        href="#pricing"
        className="inline-block bg-white text-indigo-600 font-semibold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
      >
        {t.button}
      </a>
    </section>
  )
}
