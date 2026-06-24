import type { Messages } from "@/lib/i18n"
import AnimatedCounter from "./AnimatedCounter"

type HeroProps = {
  t: Messages["hero"]
  stats: Array<{ value: string; label: string }>
}

export default function HeroSection({ t, stats }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#D2592F] px-8 sm:px-16 pt-16 sm:pt-20 pb-14 sm:pb-20 min-h-[520px] flex flex-col justify-between">

      {/* Grain texture overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Nested arch stack — right side, brand identity */}
      <div aria-hidden="true" className="pointer-events-none absolute right-0 bottom-0 translate-x-[18%] translate-y-[12%]">
        {/* Outer arch */}
        <div
          className="w-[480px] h-[480px] rounded-t-full"
          style={{ background: "rgba(0,0,0,0.12)" }}
        />
        {/* Mid arch */}
        <div
          className="absolute left-[15%] right-[15%] bottom-0 top-[18%] rounded-t-full"
          style={{ background: "rgba(0,0,0,0.14)" }}
        />
        {/* Inner arch */}
        <div
          className="absolute left-[31%] right-[31%] bottom-0 top-[38%] rounded-t-full"
          style={{ background: "rgba(0,0,0,0.13)" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl">
        {/* Eyebrow */}
        <p
          className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both text-[#F3B43C] text-xs tracking-[0.2em] uppercase mb-5"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          {t.badge}
        </p>

        {/* Headline */}
        <h1
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both text-[#F3EADA] leading-[0.92] tracking-[-0.01em]"
          style={{
            fontFamily: "var(--font-instrument-serif)",
            fontSize: "clamp(3rem, 7vw, 6rem)",
          }}
        >
          {t.title}
          <br />
          <em style={{ color: "#F3B43C", fontStyle: "italic" }}>{t.titleHighlight}</em>
        </h1>

        {/* Body copy */}
        <p
          className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200 fill-mode-both text-[rgba(243,234,218,0.85)] text-base sm:text-lg leading-relaxed mt-5 max-w-xl"
        >
          {t.subtitle}
        </p>
      </div>

      {/* Bottom row: CTAs + stats */}
      <div className="relative z-10 mt-10 sm:mt-14">
        {/* Buttons */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-10 sm:mb-14">
          <a
            href="#pricing"
            className="bg-[#F3EADA] text-[#2A2018] font-semibold px-7 py-3.5 rounded-full hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm hover:shadow-md text-sm"
          >
            {t.seePlans} →
          </a>
          <a
            href="#features"
            className="border border-[rgba(243,234,218,0.45)] text-[#F3EADA] font-medium px-7 py-3.5 rounded-full hover:border-[rgba(243,234,218,0.7)] hover:bg-[rgba(243,234,218,0.08)] transition-colors text-sm"
          >
            {t.learnMore}
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-10 border-t border-[rgba(243,234,218,0.2)] pt-8">
          {stats.map(({ value, label }) => (
            <AnimatedCounter key={label} value={value} label={label} />
          ))}
        </div>
      </div>
    </section>
  )
}
