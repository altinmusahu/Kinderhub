import type { Metadata } from "next"
import Link from "next/link"
import {
  CalendarCheck,
  MessageCircle,
  BarChart3,
  ShieldCheck,
  Users,
  CreditCard,
  FileText,
  BookOpen,
  ArrowRight,
} from "lucide-react"
import PublicLayout from "@/app/components/landing/PublicLayout"

export const metadata: Metadata = {
  title: "Modules",
  description:
    "Kinderhub is built from 8 dedicated modules: Attendance, Communication, Reports, Staff & Families, Billing, Documents, Calendar, and Security. Each one is purpose-built for kindergartens.",
  alternates: { canonical: "https://kinderhub.app/modules" },
  openGraph: {
    title: "Kinderhub Modules — Purpose-Built for Kindergartens",
    description:
      "Attendance, Communication, Reports, Billing, and more — eight modules that work together as one platform.",
    url: "https://kinderhub.app/modules",
  },
}

const MODULES = [
  {
    id: "attendance",
    icon: CalendarCheck,
    label: "Attendance & Scheduling",
    tagline: "Real-time check-in/out, absence alerts, and audit-ready logs",
    description:
      "Replace paper registers with a digital, one-tap check-in system. Staff mark arrivals and departures in seconds. Parents receive push notifications the moment their child is signed in or out. Monthly attendance reports are export-ready for licensing bodies.",
    keyPoints: [
      "Daily, weekly, monthly attendance reports",
      "Automatic absence notifications to parents",
      "Class-based or individual tracking",
      "Exportable audit trail (PDF / CSV)",
    ],
    accent: "#D2592F",
    bg: "#FFF5F0",
  },
  {
    id: "communication",
    icon: MessageCircle,
    label: "Parent Communication",
    tagline: "Secure messaging that replaces scattered WhatsApp groups",
    description:
      "Send individual messages or broadcast announcements to all families — or just to one class. Share photos, documents, and updates in a GDPR-compliant channel. No more managing parent contact groups across five different apps.",
    keyPoints: [
      "Direct and group messaging",
      "Photo and file sharing",
      "Read receipts and delivery status",
      "Scheduled announcement messages",
    ],
    accent: "#7FA06A",
    bg: "#F3FAF0",
  },
  {
    id: "reports",
    icon: BarChart3,
    label: "Reports & Analytics",
    tagline: "The numbers that matter — always up to date",
    description:
      "Kinderhub surfaces occupancy rates, revenue summaries, attendance trends, and per-child activity data in clear dashboards. Export any report to PDF or CSV for your board, your accountant, or your licensing inspector.",
    keyPoints: [
      "Live occupancy and enrollment dashboards",
      "Revenue vs outstanding invoices",
      "Per-class and per-child activity logs",
      "One-click export to PDF / CSV",
    ],
    accent: "#8FB7C9",
    bg: "#F0F6FA",
  },
  {
    id: "staff",
    icon: Users,
    label: "Staff & Families",
    tagline: "Every person in your school — organised and searchable",
    description:
      "Staff profiles include roles, contracts, and qualifications. Family records store child details, medical notes, allergy alerts, emergency contacts, and authorised pickup lists — all searchable and accessible from mobile.",
    keyPoints: [
      "Staff roles, contracts, and qualifications",
      "Child medical flags and allergy alerts",
      "Authorised pickup lists with optional PIN",
      "Emergency contact quick-dial",
    ],
    accent: "#F3B43C",
    bg: "#FDF8EC",
  },
  {
    id: "billing",
    icon: CreditCard,
    label: "Billing & Invoicing",
    tagline: "Automated invoicing that gets you paid on time",
    description:
      "Kinderhub generates invoices automatically based on your subscription plans and sends them to families each month. Track outstanding balances, send reminders, and export billing data — without ever opening a spreadsheet.",
    keyPoints: [
      "Automatic monthly invoice generation",
      "Payment status tracking (paid / overdue)",
      "Automated reminder emails",
      "Revenue and outstanding balance reports",
    ],
    accent: "#D2592F",
    bg: "#FFF5F0",
  },
  {
    id: "documents",
    icon: FileText,
    label: "Documents",
    tagline: "Every policy, form, and file — version-controlled",
    description:
      "Upload policies, consent forms, risk assessments, and inspection reports to a shared library. Organise by folder, track who has downloaded what, and always know which version is current.",
    keyPoints: [
      "Centralised document library",
      "Staff and parent document categories",
      "Version history for every document",
      "Download tracking per staff member",
    ],
    accent: "#7FA06A",
    bg: "#F3FAF0",
  },
  {
    id: "calendar",
    icon: BookOpen,
    label: "Calendar & Activities",
    tagline: "Your whole term planned and shared automatically",
    description:
      "Plan events, schedule sessions, and manage term dates in a shared calendar. Staff see the full picture; parents see a filtered view of their child's upcoming events. Export to iCal for personal calendar apps.",
    keyPoints: [
      "Shared staff calendar with event types",
      "Parent-visible activity schedule",
      "Term dates and holiday planning",
      "iCal export for Google / Apple calendar",
    ],
    accent: "#8FB7C9",
    bg: "#F0F6FA",
  },
  {
    id: "security",
    icon: ShieldCheck,
    label: "Security & GDPR Compliance",
    tagline: "EU-first data protection, built into every layer",
    description:
      "Kinderhub is designed GDPR-first: EU data residency, role-based access control, encrypted storage, TLS 1.3 in transit, and automatic data retention rules. You stay compliant without needing a specialist on retainer.",
    keyPoints: [
      "EU data residency — never leaves Europe",
      "Role-based access control",
      "Encrypted storage + TLS 1.3 in transit",
      "Configurable data retention and deletion",
    ],
    accent: "#E48F8F",
    bg: "#FDF5F5",
  },
]

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Kinderhub Modules",
  description: "The eight modules that make up the Kinderhub kindergarten management platform.",
  itemListElement: MODULES.map((m, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: m.label,
    description: m.tagline,
    url: `https://kinderhub.app/modules#${m.id}`,
  })),
}

export default function ModulesPage() {
  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[#2A2018] px-4 sm:px-8 py-16 sm:py-24 text-center relative overflow-hidden">
        <div aria-hidden="true" className="absolute -top-20 right-0 w-80 h-80 rounded-full bg-[#D2592F]/10" />
        <span
          className="inline-block text-xs tracking-widest text-[#F3B43C] uppercase mb-4"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          Platform Modules
        </span>
        <h1
          className="text-4xl sm:text-6xl text-[#F3EADA] leading-tight max-w-3xl mx-auto"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          Eight modules. One platform.
        </h1>
        <p className="text-[#5B4D3F] mt-5 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Every module is purpose-built for kindergartens and works together seamlessly. No integrations to maintain, no data silos — just one system that runs your school.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {MODULES.map(({ id, label, icon: Icon, accent }) => (
            <a
              key={id}
              href={`#${id}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#3D3020] hover:border-[#D2592F]/50 text-[#5B4D3F] hover:text-[#F3EADA] transition-colors"
            >
              <Icon size={12} style={{ color: accent }} />
              {label}
            </a>
          ))}
        </div>
      </section>

      {/* Module cards */}
      <section className="py-16 sm:py-24 bg-[#F3EADA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-16 sm:space-y-24">
          {MODULES.map(({ id, icon: Icon, label, tagline, description, keyPoints, accent, bg }, i) => (
            <div
              key={id}
              id={id}
              className={`grid md:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
              style={i % 2 === 1 ? { direction: "rtl" } : {}}
            >
              {/* Text side */}
              <div style={{ direction: "ltr" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: accent + "22" }}
                  >
                    <Icon size={20} style={{ color: accent }} />
                  </div>
                  <span
                    className="text-xs tracking-widest uppercase font-semibold"
                    style={{ color: accent, fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    {label}
                  </span>
                </div>
                <h2
                  className="text-2xl sm:text-3xl text-[#2A2018] leading-tight mb-3"
                  style={{ fontFamily: "var(--font-instrument-serif)" }}
                >
                  {tagline}
                </h2>
                <p className="text-[#5B4D3F] text-sm leading-relaxed mb-5">{description}</p>
                <ul className="space-y-2 mb-6">
                  {keyPoints.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm text-[#5B4D3F]">
                      <span
                        className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{ background: accent, color: "#F3EADA" }}
                      >
                        ✓
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/features#${id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                  style={{ color: accent }}
                >
                  See full feature details <ArrowRight size={14} />
                </Link>
              </div>

              {/* Visual placeholder side */}
              <div
                className="rounded-2xl aspect-video flex flex-col items-center justify-center border border-dashed gap-3"
                style={{ background: bg, borderColor: accent + "44", direction: "ltr" }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: accent + "22" }}
                >
                  <Icon size={28} style={{ color: accent }} />
                </div>
                <p
                  className="text-xs text-center px-6 leading-relaxed"
                  style={{ color: accent, fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  {label} module preview — video coming soon
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#D2592F] py-14 px-4 sm:px-8 text-center">
        <h2
          className="text-3xl sm:text-4xl text-[#F3EADA] mb-3"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          All eight modules, one subscription
        </h2>
        <p className="text-[#F0A878] text-sm sm:text-base mb-7 max-w-md mx-auto">
          No module add-ons, no hidden costs. Every plan includes the full platform.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/pricing"
            className="inline-block bg-[#F3EADA] hover:bg-white text-[#D2592F] font-semibold px-8 py-3.5 rounded-full transition-colors text-sm"
          >
            See Pricing →
          </Link>
          <Link
            href="/signup"
            className="inline-block border border-[#F3EADA]/50 hover:bg-[#F3EADA]/10 text-[#F3EADA] font-semibold px-8 py-3.5 rounded-full transition-colors text-sm"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
