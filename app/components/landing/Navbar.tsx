"use client"

import { useState } from "react"
import Link from "next/link"
import LanguageSwitcher from "../LanguageSwitcher"
import type { Locale } from "@/lib/i18n"

type NavbarProps = {
  t: { features: string; pricing: string; dashboard: string }
  locale: Locale
}

export default function Navbar({ t, locale }: NavbarProps) {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-[#F3EADA]/95 backdrop-blur-sm border-b border-[#EBDFC9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Arch mark */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect width="28" height="28" rx="7" fill="#D2592F"/>
              <path d="M6 22V13a8 8 0 0 1 16 0v9" stroke="#F3EADA" strokeWidth="2.2" strokeLinecap="round"/>
              <circle cx="9" cy="19" r="1.5" fill="#F3B43C"/>
              <circle cx="14" cy="17.5" r="1.5" fill="#F3B43C"/>
              <circle cx="19" cy="19" r="1.5" fill="#F3B43C"/>
            </svg>
            <span
              className="text-[22px] leading-none text-[#2A2018]"
              style={{ fontFamily: "var(--font-instrument-serif)" }}
            >
              Kinderhub
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5B4D3F]">
            <a href="#features" className="hover:text-[#2A2018] transition-colors">
              {t.features}
            </a>
            <a href="#pricing" className="hover:text-[#2A2018] transition-colors">
              {t.pricing}
            </a>
            <Link
              href="/dashboard"
              className="bg-[#D2592F] hover:bg-[#b8441d] text-[#F3EADA] px-5 py-2 rounded-full font-semibold transition-colors text-sm"
            >
              {t.dashboard}
            </Link>
            <LanguageSwitcher current={locale} />
          </div>

          {/* Mobile: lang switcher + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <LanguageSwitcher current={locale} />
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              className="p-2 text-[#5B4D3F] hover:text-[#2A2018] transition-colors"
            >
              {open ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden flex flex-col gap-1 pb-4 border-t border-[#EBDFC9] pt-3">
            <a
              href="#features"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-[#5B4D3F] hover:bg-[#EBDFC9] hover:text-[#2A2018] transition-colors"
            >
              {t.features}
            </a>
            <a
              href="#pricing"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-[#5B4D3F] hover:bg-[#EBDFC9] hover:text-[#2A2018] transition-colors"
            >
              {t.pricing}
            </a>
            <Link
              href="/dashboard"
              className="mt-1 text-center bg-[#D2592F] hover:bg-[#b8441d] text-[#F3EADA] text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
            >
              {t.dashboard}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
