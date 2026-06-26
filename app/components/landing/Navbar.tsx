"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import LanguageSwitcher from "../LanguageSwitcher"
import type { Locale } from "@/lib/i18n"
import {
  CalendarCheck,
  MessageCircle,
  BarChart3,
  ShieldCheck,
  Users,
  CreditCard,
  FileText,
  BookOpen,
  ChevronDown,
} from "lucide-react"

type NavbarProps = {
  t: { features: string; pricing: string; dashboard: string }
  locale: Locale
}

const MODULES = [
  {
    icon: CalendarCheck,
    label: "Attendance",
    desc: "Daily check-in/out, absence alerts",
    href: "/modules#attendance",
  },
  {
    icon: MessageCircle,
    label: "Communication",
    desc: "Parent messaging & notifications",
    href: "/modules#communication",
  },
  {
    icon: BarChart3,
    label: "Reports",
    desc: "Analytics, exports & dashboards",
    href: "/modules#reports",
  },
  {
    icon: Users,
    label: "Staff & Families",
    desc: "Staff profiles, family records",
    href: "/modules#staff",
  },
  {
    icon: CreditCard,
    label: "Billing",
    desc: "Invoices, plans & payments",
    href: "/modules#billing",
  },
  {
    icon: FileText,
    label: "Documents",
    desc: "Shared org documents & files",
    href: "/modules#documents",
  },
  {
    icon: BookOpen,
    label: "Calendar",
    desc: "Events, schedules & activities",
    href: "/modules#calendar",
  },
  {
    icon: ShieldCheck,
    label: "Security",
    desc: "GDPR-compliant data protection",
    href: "/modules#security",
  },
]

export default function Navbar({ t, locale }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [modulesOpen, setModulesOpen] = useState(false)
  const [mobileModulesOpen, setMobileModulesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModulesOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setModulesOpen(false)
    setMobileModulesOpen(false)
  }, [pathname])

  return (
    <nav className="sticky top-0 z-40 bg-[#F3EADA]/95 backdrop-blur-sm border-b border-[#EBDFC9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
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
          <div className="hidden md:flex items-center gap-1 text-sm font-medium text-[#5B4D3F]">

            {/* Modules dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setModulesOpen((o) => !o)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-[#EBDFC9] hover:text-[#2A2018] transition-colors"
                aria-expanded={modulesOpen}
                aria-haspopup="true"
              >
                Modules
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${modulesOpen ? "rotate-180" : ""}`}
                />
              </button>

              {modulesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] bg-[#F3EADA] border border-[#EBDFC9] rounded-2xl shadow-xl p-4 grid grid-cols-2 gap-1">
                  <div className="col-span-2 px-2 pb-2 mb-1 border-b border-[#EBDFC9]">
                    <span className="text-xs font-semibold text-[#5B4D3F] tracking-widest uppercase"
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                      All Modules
                    </span>
                  </div>
                  {MODULES.map(({ icon: Icon, label, desc, href }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setModulesOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#EBDFC9] transition-colors group"
                    >
                      <div className="mt-0.5 w-8 h-8 rounded-lg bg-[#D2592F]/10 group-hover:bg-[#D2592F]/20 flex items-center justify-center shrink-0 transition-colors">
                        <Icon size={15} className="text-[#D2592F]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#2A2018] leading-tight">{label}</p>
                        <p className="text-xs text-[#5B4D3F] mt-0.5 leading-tight">{desc}</p>
                      </div>
                    </Link>
                  ))}
                  <div className="col-span-2 mt-1 pt-2 border-t border-[#EBDFC9]">
                    <Link
                      href="/modules"
                      onClick={() => setModulesOpen(false)}
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#D2592F] hover:text-[#b8441d] py-1 transition-colors"
                    >
                      View all modules →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/features" className="px-3 py-2 rounded-lg hover:bg-[#EBDFC9] hover:text-[#2A2018] transition-colors">
              {t.features}
            </Link>
            <Link href="/pricing" className="px-3 py-2 rounded-lg hover:bg-[#EBDFC9] hover:text-[#2A2018] transition-colors">
              {t.pricing}
            </Link>
            <Link href="/faq" className="px-3 py-2 rounded-lg hover:bg-[#EBDFC9] hover:text-[#2A2018] transition-colors">
              FAQ
            </Link>
            <Link href="/contact" className="px-3 py-2 rounded-lg hover:bg-[#EBDFC9] hover:text-[#2A2018] transition-colors">
              Contact
            </Link>

            <div className="w-px h-5 bg-[#EBDFC9] mx-1" />

            {/* Social icons */}
            <a
              href="https://www.instagram.com/kinderhubapp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kinderhub on Instagram"
              className="p-2 rounded-lg hover:bg-[#EBDFC9] text-[#5B4D3F] hover:text-[#2A2018] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
              className="p-2 rounded-lg hover:bg-[#EBDFC9] text-[#5B4D3F] hover:text-[#2A2018] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>

            <div className="w-px h-5 bg-[#EBDFC9] mx-1" />

            <Link
              href="/dashboard"
              className="bg-[#D2592F] hover:bg-[#b8441d] text-[#F3EADA] px-5 py-2 rounded-full font-semibold transition-colors text-sm"
            >
              {t.dashboard}
            </Link>
            <LanguageSwitcher current={locale} />
          </div>

          {/* Mobile: lang + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <LanguageSwitcher current={locale} />
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              className="p-2 text-[#5B4D3F] hover:text-[#2A2018] transition-colors"
            >
              {menuOpen ? (
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
        {menuOpen && (
          <div className="md:hidden flex flex-col gap-1 pb-4 border-t border-[#EBDFC9] pt-3">
            {/* Modules accordion */}
            <button
              onClick={() => setMobileModulesOpen((o) => !o)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-[#5B4D3F] hover:bg-[#EBDFC9] hover:text-[#2A2018] transition-colors"
            >
              <span>Modules</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${mobileModulesOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileModulesOpen && (
              <div className="mx-3 mb-1 grid grid-cols-1 gap-1 bg-[#F3EADA] border border-[#EBDFC9] rounded-xl p-2">
                {MODULES.map(({ icon: Icon, label, desc, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#EBDFC9] transition-colors"
                  >
                    <Icon size={14} className="text-[#D2592F] shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#2A2018] leading-tight">{label}</p>
                      <p className="text-xs text-[#5B4D3F]">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Link href="/features" className="px-3 py-2 rounded-lg text-sm font-medium text-[#5B4D3F] hover:bg-[#EBDFC9] hover:text-[#2A2018] transition-colors">
              {t.features}
            </Link>
            <Link href="/pricing" className="px-3 py-2 rounded-lg text-sm font-medium text-[#5B4D3F] hover:bg-[#EBDFC9] hover:text-[#2A2018] transition-colors">
              {t.pricing}
            </Link>
            <Link href="/faq" className="px-3 py-2 rounded-lg text-sm font-medium text-[#5B4D3F] hover:bg-[#EBDFC9] hover:text-[#2A2018] transition-colors">
              FAQ
            </Link>
            <Link href="/contact" className="px-3 py-2 rounded-lg text-sm font-medium text-[#5B4D3F] hover:bg-[#EBDFC9] hover:text-[#2A2018] transition-colors">
              Contact
            </Link>

            {/* Social */}
            <div className="flex items-center gap-3 px-3 py-2">
              <a
                href="https://www.instagram.com/kinderhubapp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-[#5B4D3F] hover:text-[#2A2018] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/kinderhubapp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-[#5B4D3F] hover:text-[#2A2018] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <span className="text-xs text-[#5B4D3F]">Follow us</span>
            </div>

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
