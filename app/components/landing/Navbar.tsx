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
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight text-indigo-600">
            KinderHub
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">
              {t.features}
            </a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">
              {t.pricing}
            </a>
            <Link
              href="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
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
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
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
          <div className="md:hidden flex flex-col gap-1 pb-4 border-t border-gray-100 pt-3">
            <a
              href="#features"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              {t.features}
            </a>
            <a
              href="#pricing"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              {t.pricing}
            </a>
            <Link
              href="/dashboard"
              className="mt-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {t.dashboard}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
