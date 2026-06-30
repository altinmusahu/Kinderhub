import type { Metadata } from "next"
import Link from "next/link"
import PublicLayout from "@/app/components/landing/PublicLayout"

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Answers to the most common questions about Kinderhub — pricing, GDPR compliance, trial periods, onboarding, modules, and more.",
  alternates: { canonical: "https://kinderhub.app/faq" },
  openGraph: {
    title: "Kinderhub FAQ — Frequently Asked Questions",
    description:
      "Everything you need to know about Kinderhub, pricing, GDPR, and getting started.",
    url: "https://kinderhub.app/faq",
  },
}

const FAQS: { q: string; a: string }[] = [
  {
    q: "Is there a free trial?",
    a: "Yes — every plan starts with a 14-day free trial. No credit card is required to start. You get access to all features for your plan tier during the trial period.",
  },
  {
    q: "Can I cancel at any time?",
    a: "Absolutely. You can cancel your subscription at any time from your account settings. You will retain access until the end of your current billing period and will not be charged again.",
  },
  {
    q: "Is Kinderhub GDPR compliant?",
    a: "Yes. Kinderhub is built GDPR-first. All data is stored on EU servers, encrypted at rest and in transit (TLS 1.3). You retain full ownership of your data. We provide data processing agreements (DPAs) for all paid plans and support configurable data retention and deletion.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "After cancellation you can export all your data (children, staff, families, records, reports) as CSV/PDF within 30 days. After 30 days your data is deleted from our servers in accordance with our retention policy.",
  },
  {
    q: "How many children can I manage on each plan?",
    a: "The Starter plan supports up to 35 children. The Growth plan supports up to 100. The Enterprise plan has no limit and also supports multiple locations. You can upgrade at any time as your school grows.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Kinderhub is a web-based platform that works in any modern browser on desktop, tablet, and mobile. There is nothing to install or maintain.",
  },
  {
    q: "Does Kinderhub support multiple languages?",
    a: "Yes. Kinderhub currently supports English and Albanian, with more languages on the roadmap. The platform automatically detects your browser language or lets you switch manually.",
  },
  {
    q: "Can parents access the platform?",
    a: "Parents receive notifications and messages via the parent-facing channel — they do not need their own login for basic communication. The Growth and Enterprise plans include a parent portal where parents can view schedules, attendance records, and reports.",
  },
  {
    q: "Is my data backed up?",
    a: "Yes. We run automated daily backups with point-in-time recovery for all paid plans. Enterprise plans include extended backup retention and priority recovery SLAs.",
  },
  {
    q: "Do you offer onboarding help?",
    a: "All plans include email support and access to our documentation. Growth plan customers get priority support with faster response times. Enterprise customers get a dedicated account manager who handles setup, data migration, and staff training.",
  },
  {
    q: "Can I import data from my existing system?",
    a: "Yes — we support CSV import for children, family, and staff records. Enterprise customers with complex migrations get hands-on help from our team.",
  },
  {
    q: "Is there a limit on staff accounts?",
    a: "The Starter plan includes 10 staff accounts. Growth includes 25. Enterprise is unlimited. You can add, remove, and manage staff roles from the settings panel.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards. Enterprise customers can request invoice-based payment (bank transfer). All payments are processed securely.",
  },
  {
    q: "Do you offer discounts for non-profits or charities?",
    a: "Yes — we offer a 20% discount for registered non-profit kindergartens and childcare charities. Contact us at hello@kinderhub.app with your registration details to apply.",
  },
]

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
}

export default function FAQPage() {
  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[#F3EADA] px-4 sm:px-8 py-16 sm:py-20 text-center">
        <span
          className="inline-block text-xs tracking-widest text-[#D2592F] uppercase mb-4"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          FAQ
        </span>
        <h1
          className="text-4xl sm:text-5xl text-[#2A2018] leading-tight max-w-2xl mx-auto"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          Frequently asked questions
        </h1>
        <p className="text-[#5B4D3F] mt-4 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
          Can&apos;t find what you&apos;re looking for?{" "}
          <Link href="/contact" className="text-[#D2592F] hover:underline font-medium">
            Contact us
          </Link>{" "}
          and we&apos;ll get back to you within one business day.
        </p>
      </section>

      {/* FAQ list */}
      <section className="bg-[#EBDFC9] py-14 sm:py-20 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map(({ q, a }, i) => (
            <details
              key={i}
              className="group bg-[#F3EADA] rounded-2xl border border-[#EBDFC9] overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none text-[#2A2018] font-semibold text-sm sm:text-base select-none hover:text-[#D2592F] transition-colors">
                <span>{q}</span>
                <svg
                  className="shrink-0 text-[#D2592F] transition-transform duration-200 group-open:rotate-180"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="px-6 pb-5 pt-1 text-sm text-[#5B4D3F] leading-relaxed border-t border-[#EBDFC9]">
                {a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#F3EADA] py-12 px-4 sm:px-8 text-center">
        <h2
          className="text-2xl sm:text-3xl text-[#2A2018] mb-3"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          Still have questions?
        </h2>
        <p className="text-[#5B4D3F] text-sm mb-6">We&apos;re happy to help — reach out any time.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="inline-block bg-[#D2592F] hover:bg-[#b8441d] text-[#F3EADA] font-semibold px-8 py-3.5 rounded-full transition-colors text-sm"
          >
            Contact Us →
          </Link>
          <Link
            href="/pricing"
            className="inline-block border border-[#D2592F]/40 text-[#D2592F] hover:bg-[#D2592F]/5 font-semibold px-8 py-3.5 rounded-full transition-colors text-sm"
          >
            See Pricing
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
