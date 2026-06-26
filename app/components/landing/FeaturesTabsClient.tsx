"use client"

import { useState } from "react"
import {
  CalendarCheck,
  MessageCircle,
  BarChart3,
  ShieldCheck,
  Users,
  CreditCard,
  FileText,
  BookOpen,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Feature = {
  id: string
  icon: LucideIcon
  label: string
  tagline: string
  description: string
  bullets: string[]
  accent: string
  videoPlaceholder: string
}

const FEATURES: Feature[] = [
  {
    id: "attendance",
    icon: CalendarCheck,
    label: "Attendance",
    tagline: "Know who's here — in seconds",
    description:
      "Kinderhub's attendance module replaces paper registers with a digital, real-time system. Staff check children in and out in one tap, parents receive instant notifications, and you get a full audit trail exportable to PDF or CSV.",
    bullets: [
      "One-tap check-in / check-out for every child",
      "Automatic absence alerts sent to parents",
      "Daily, weekly, and monthly attendance reports",
      "Integration with billing (absence-based billing rules)",
      "Audit log for compliance and inspection readiness",
    ],
    accent: "#D2592F",
    videoPlaceholder: "Attendance module walkthrough video — coming soon",
  },
  {
    id: "communication",
    icon: MessageCircle,
    label: "Communication",
    tagline: "Keep parents in the loop, effortlessly",
    description:
      "Send individual or broadcast messages to families directly from the dashboard. Activity updates, announcements, and media sharing — all in one secure channel without WhatsApp groups or scattered emails.",
    bullets: [
      "Direct messaging between staff and parents",
      "Group announcements to all families or specific classes",
      "Photo and document sharing (GDPR-compliant)",
      "Read receipts and delivery confirmation",
      "Scheduled messages for event reminders",
    ],
    accent: "#7FA06A",
    videoPlaceholder: "Communication module walkthrough video — coming soon",
  },
  {
    id: "reports",
    icon: BarChart3,
    label: "Reports & Analytics",
    tagline: "Data-driven decisions, made simple",
    description:
      "From occupancy rates to financial summaries, Kinderhub surfaces the numbers that matter. No spreadsheets — just clean dashboards you can present to your board or licensing body in one click.",
    bullets: [
      "Real-time occupancy and enrollment dashboards",
      "Revenue vs. outstanding invoices overview",
      "Per-class and per-child activity reports",
      "Exportable PDFs and CSV for accounting",
      "Month-over-month trend visualisations",
    ],
    accent: "#8FB7C9",
    videoPlaceholder: "Reports module walkthrough video — coming soon",
  },
  {
    id: "security",
    icon: ShieldCheck,
    label: "Security & GDPR",
    tagline: "Your children's data, always protected",
    description:
      "Kinderhub is built GDPR-first. Data residency in the EU, role-based access control, and automatic data retention rules ensure you're always compliant — without needing a data-protection lawyer on retainer.",
    bullets: [
      "EU data residency — data never leaves Europe",
      "Role-based access (staff see only what they need)",
      "Automatic data deletion after configurable retention periods",
      "Encrypted storage and in-transit encryption (TLS 1.3)",
      "Audit logs for every data access event",
    ],
    accent: "#E48F8F",
    videoPlaceholder: "Security & GDPR walkthrough video — coming soon",
  },
  {
    id: "staff",
    icon: Users,
    label: "Staff & Families",
    tagline: "All your people, one place",
    description:
      "Manage staff profiles, assign classes, track contracts and qualifications. On the family side, store child records, emergency contacts, medical notes, and authorised pickups — all searchable in seconds.",
    bullets: [
      "Staff profiles with role, contract, and qualifications",
      "Class assignment and capacity management",
      "Child records with medical flags and allergy alerts",
      "Authorised pickup lists with optional PIN verification",
      "Emergency contact quick-dial from mobile",
    ],
    accent: "#F3B43C",
    videoPlaceholder: "Staff & Families module walkthrough video — coming soon",
  },
  {
    id: "billing",
    icon: CreditCard,
    label: "Billing",
    tagline: "Get paid on time, every time",
    description:
      "Automate invoice generation based on your subscription plans, send reminders, and track outstanding balances — all without leaving Kinderhub. Supports monthly, term-based, and custom billing cycles.",
    bullets: [
      "Automatic monthly invoice generation per family",
      "Payment status tracking (paid, outstanding, overdue)",
      "Automated payment reminders via email",
      "Revenue and outstanding balance summaries",
      "Export invoices as PDF for manual payment",
    ],
    accent: "#D2592F",
    videoPlaceholder: "Billing module walkthrough video — coming soon",
  },
  {
    id: "documents",
    icon: FileText,
    label: "Documents",
    tagline: "Every form, policy, and file — organised",
    description:
      "Upload and share policies, consent forms, risk assessments, and inspection reports with your team. Version-controlled so you always know which document is current.",
    bullets: [
      "Centralised document library for the whole organisation",
      "Staff-facing and parent-facing document categories",
      "Version history for every document",
      "Download tracking (know who has seen what)",
      "Bulk upload and folder organisation",
    ],
    accent: "#7FA06A",
    videoPlaceholder: "Documents module walkthrough video — coming soon",
  },
  {
    id: "calendar",
    icon: BookOpen,
    label: "Calendar",
    tagline: "Your whole term at a glance",
    description:
      "Plan events, schedule staff activities, and manage term dates in a shared calendar that syncs across your whole team. Parents see a filtered view of their child's upcoming events.",
    bullets: [
      "Shared staff calendar with event planning",
      "Parent-visible events and activity schedules",
      "Term date management and holiday planning",
      "Recurring events (weekly sessions, monthly reviews)",
      "iCal export for personal calendar apps",
    ],
    accent: "#8FB7C9",
    videoPlaceholder: "Calendar module walkthrough video — coming soon",
  },
]

export default function FeaturesTabsClient() {
  const [active, setActive] = useState(FEATURES[0].id)
  const current = FEATURES.find((f) => f.id === active) ?? FEATURES[0]
  const Icon = current.icon

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8">
      {/* Tab strip */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        {FEATURES.map(({ id, icon: TabIcon, label, accent }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150 ${
              active === id
                ? "text-[#F3EADA] border-transparent shadow-md"
                : "bg-[#F3EADA] text-[#5B4D3F] border-[#EBDFC9] hover:border-[#D2592F]/40 hover:text-[#2A2018]"
            }`}
            style={active === id ? { background: accent, borderColor: accent } : {}}
          >
            <TabIcon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Text */}
        <div>
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5"
            style={{ background: current.accent + "22" }}
          >
            <Icon size={22} style={{ color: current.accent }} />
          </div>
          <h2
            className="text-3xl sm:text-4xl text-[#2A2018] leading-tight mb-3"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            {current.tagline}
          </h2>
          <p className="text-[#5B4D3F] leading-relaxed mb-6 text-sm sm:text-base">
            {current.description}
          </p>
          <ul className="space-y-3">
            {current.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-[#5B4D3F]">
                <span
                  className="mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                  style={{ background: current.accent, color: "#F3EADA" }}
                >
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Video placeholder */}
        <div
          className="rounded-2xl aspect-video flex flex-col items-center justify-center border-2 border-dashed gap-3"
          style={{ borderColor: current.accent + "55", background: current.accent + "08" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: current.accent + "22" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              width="24"
              height="24"
              stroke="currentColor"
              strokeWidth="1.8"
              style={{ color: current.accent }}
            >
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
            </svg>
          </div>
          <p
            className="text-xs text-center max-w-[200px] leading-relaxed"
            style={{ color: current.accent, fontFamily: "var(--font-jetbrains-mono)" }}
          >
            {current.videoPlaceholder}
          </p>
        </div>
      </div>
    </div>
  )
}
