import type { Messages } from "@/lib/i18n"

type FeaturesProps = {
  t: Messages["featuresSection"]
}

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
          {features.map(({ title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
