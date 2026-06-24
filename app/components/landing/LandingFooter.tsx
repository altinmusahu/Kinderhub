import type { Messages } from "@/lib/i18n"

type FooterProps = {
  t: Messages["footer"]
}

export default function LandingFooter({ t }: FooterProps) {
  return (
    <footer className="bg-[#2A2018] border-t border-[#5B4D3F]/30 py-8 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect width="28" height="28" rx="7" fill="#D2592F"/>
          <path d="M6 22V13a8 8 0 0 1 16 0v9" stroke="#F3EADA" strokeWidth="2.2" strokeLinecap="round"/>
          <circle cx="9" cy="19" r="1.5" fill="#F3B43C"/>
          <circle cx="14" cy="17.5" r="1.5" fill="#F3B43C"/>
          <circle cx="19" cy="19" r="1.5" fill="#F3B43C"/>
        </svg>
        <span
          className="text-[18px] text-[#F3EADA]"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          Kinderhub
        </span>
      </div>

      <span
        className="text-xs text-[#5B4D3F] tracking-widest"
        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
      >
        © {new Date().getFullYear()} {t.rights}
      </span>
    </footer>
  )
}
