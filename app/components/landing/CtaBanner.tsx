import type { Messages } from "@/lib/i18n"

type CtaBannerProps = {
  t: Messages["ctaBanner"]
}

export default function CtaBanner({ t }: CtaBannerProps) {
  return (
    <section className="relative overflow-hidden bg-[#D2592F] py-16 sm:py-24 text-center px-4">

      {/* Decorative nested arches (brand mark language) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-end justify-center overflow-hidden">
        <div className="w-[700px] h-[700px] relative flex-shrink-0">
          <div className="absolute inset-0 rounded-t-full" style={{ background: "#F3B43C", mixBlendMode: "multiply", opacity: 0.25 }} />
          <div className="absolute left-[14%] right-[14%] bottom-0 top-[20%] rounded-t-full" style={{ background: "#F0A878", mixBlendMode: "multiply", opacity: 0.2 }} />
          <div className="absolute left-[30%] right-[30%] bottom-0 top-[42%] rounded-t-full" style={{ background: "#E48F8F", mixBlendMode: "multiply", opacity: 0.2 }} />
        </div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <h2
          className="text-3xl sm:text-5xl text-[#F3EADA] leading-tight mb-4"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          {t.title}
          <em className="block not-italic" style={{ fontStyle: "italic", color: "#F3B43C" }}>&nbsp;</em>
        </h2>
        <p className="text-[#F0A878] mb-10 text-sm sm:text-base max-w-md mx-auto leading-relaxed">{t.subtitle}</p>
        <a
          href="#pricing"
          className="inline-block bg-[#F3EADA] text-[#D2592F] font-semibold px-10 py-4 rounded-full hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm hover:shadow-md"
        >
          {t.button}
        </a>
      </div>
    </section>
  )
}
