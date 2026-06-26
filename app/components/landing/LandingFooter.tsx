import Link from "next/link"
import type { Messages } from "@/lib/i18n"

type FooterProps = {
  t: Messages["footer"]
}

const KH_LOGO = (
  <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <rect width="28" height="28" rx="7" fill="#D2592F"/>
    <path d="M6 22V13a8 8 0 0 1 16 0v9" stroke="#F3EADA" strokeWidth="2.2" strokeLinecap="round"/>
    <circle cx="9" cy="19" r="1.5" fill="#F3B43C"/>
    <circle cx="14" cy="17.5" r="1.5" fill="#F3B43C"/>
    <circle cx="19" cy="19" r="1.5" fill="#F3B43C"/>
  </svg>
)

export default function LandingFooter({ t }: FooterProps) {
  return (
    <footer className="bg-[#2A2018] border-t border-[#3D3020] text-[#8A7A6A]">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">

        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 mb-4">
            {KH_LOGO}
            <span
              className="text-[18px] text-[#F3EADA]"
              style={{ fontFamily: "var(--font-instrument-serif)" }}
            >
              Kinderhub
            </span>
          </Link>
          <p className="text-xs leading-relaxed text-[#5B4D3F] max-w-[220px]">
            The all-in-one platform for kindergartens. Attendance, communication, billing, and reports — in one place.
          </p>
          {/* Social */}
          <div className="flex items-center gap-3 mt-5">
            <a
              href="https://www.instagram.com/kinderhubapp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kinderhub on Instagram"
              className="w-8 h-8 rounded-lg bg-[#3D3020] hover:bg-[#D2592F]/20 flex items-center justify-center text-[#5B4D3F] hover:text-[#F3EADA] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/kinderhubapp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kinderhub on Facebook"
              className="w-8 h-8 rounded-lg bg-[#3D3020] hover:bg-[#D2592F]/20 flex items-center justify-center text-[#5B4D3F] hover:text-[#F3EADA] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Product column */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#F3EADA] mb-4"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
            Product
          </p>
          <ul className="space-y-2.5 text-xs">
            <li><Link href="/features" className="hover:text-[#F3EADA] transition-colors">Features</Link></li>
            <li><Link href="/modules" className="hover:text-[#F3EADA] transition-colors">Modules</Link></li>
            <li><Link href="/pricing" className="hover:text-[#F3EADA] transition-colors">Pricing</Link></li>
            <li><Link href="/#features" className="hover:text-[#F3EADA] transition-colors">Overview</Link></li>
            <li><Link href="/signup" className="hover:text-[#F3EADA] transition-colors">Start Free Trial</Link></li>
          </ul>
        </div>

        {/* Modules column */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#F3EADA] mb-4"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
            Modules
          </p>
          <ul className="space-y-2.5 text-xs">
            <li><Link href="/modules#attendance" className="hover:text-[#F3EADA] transition-colors">Attendance</Link></li>
            <li><Link href="/modules#communication" className="hover:text-[#F3EADA] transition-colors">Communication</Link></li>
            <li><Link href="/modules#billing" className="hover:text-[#F3EADA] transition-colors">Billing</Link></li>
            <li><Link href="/modules#reports" className="hover:text-[#F3EADA] transition-colors">Reports</Link></li>
            <li><Link href="/modules#security" className="hover:text-[#F3EADA] transition-colors">Security & GDPR</Link></li>
          </ul>
        </div>

        {/* Company column */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#F3EADA] mb-4"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
            Company
          </p>
          <ul className="space-y-2.5 text-xs">
            <li><Link href="/contact" className="hover:text-[#F3EADA] transition-colors">Contact Us</Link></li>
            <li><Link href="/faq" className="hover:text-[#F3EADA] transition-colors">FAQ</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-[#F3EADA] transition-colors">Privacy Policy</Link></li>
            <li><Link href="/impressum" className="hover:text-[#F3EADA] transition-colors">Impressum</Link></li>
            <li><Link href="/dashboard" className="hover:text-[#F3EADA] transition-colors">Dashboard Login</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#3D3020] px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        <span
          className="text-xs text-[#5B4D3F] tracking-widest"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          © {new Date().getFullYear()} Kinderhub — {t.rights}
        </span>
        <div className="flex items-center gap-4 text-xs">
          <Link href="/privacy-policy" className="text-[#5B4D3F] hover:text-[#F3EADA] transition-colors">
            Privacy
          </Link>
          <span className="text-[#3D3020]">·</span>
          <Link href="/impressum" className="text-[#5B4D3F] hover:text-[#F3EADA] transition-colors">
            Impressum
          </Link>
          <span className="text-[#3D3020]">·</span>
          <Link href="/contact" className="text-[#5B4D3F] hover:text-[#F3EADA] transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
