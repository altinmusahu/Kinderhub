import type { Metadata } from "next"
import { Mail, MapPin, Clock } from "lucide-react"
import PublicLayout from "@/app/components/landing/PublicLayout"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Kinderhub team. We're here to help with questions about features, pricing, onboarding, or anything else. Email us or find us on social media.",
  alternates: { canonical: "https://kinderhub.app/contact" },
  openGraph: {
    title: "Contact Kinderhub",
    description: "Reach the Kinderhub team for sales, support, or general enquiries.",
    url: "https://kinderhub.app/contact",
  },
}

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Kinderhub",
  url: "https://kinderhub.app/contact",
  mainEntity: {
    "@type": "Organization",
    name: "Kinderhub",
    email: "hello@kinderhub.app",
    url: "https://kinderhub.app",
    sameAs: [
      "https://www.instagram.com/kinderhubapp",
      "https://www.facebook.com/kinderhubapp",
    ],
  },
}

export default function ContactPage() {
  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[#F3EADA] px-4 sm:px-8 py-16 sm:py-20 text-center">
        <span
          className="inline-block text-xs tracking-widest text-[#D2592F] uppercase mb-4"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          Get in touch
        </span>
        <h1
          className="text-4xl sm:text-5xl text-[#2A2018] leading-tight max-w-2xl mx-auto"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          We&apos;d love to hear from you
        </h1>
        <p className="text-[#5B4D3F] mt-4 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
          Questions about features, pricing, or getting started? Our team typically responds within one business day.
        </p>
      </section>

      {/* Content */}
      <section className="bg-[#EBDFC9] py-14 sm:py-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">

          {/* Contact info */}
          <div className="space-y-8">
            <div>
              <h2
                className="text-2xl text-[#2A2018] mb-6"
                style={{ fontFamily: "var(--font-instrument-serif)" }}
              >
                Contact details
              </h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#D2592F]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail size={16} className="text-[#D2592F]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5B4D3F] mb-0.5"
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}>Email</p>
                    <a
                      href="mailto:hello@kinderhub.app"
                      className="text-[#2A2018] font-semibold hover:text-[#D2592F] transition-colors text-sm"
                    >
                      hello@kinderhub.app
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#D2592F]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={16} className="text-[#D2592F]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5B4D3F] mb-0.5"
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}>Response time</p>
                    <p className="text-[#2A2018] font-semibold text-sm">Within 1 business day</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#D2592F]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={16} className="text-[#D2592F]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5B4D3F] mb-0.5"
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}>Based in</p>
                    <p className="text-[#2A2018] font-semibold text-sm">Europe (EU data residency)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social */}
            <div>
              <h3
                className="text-lg text-[#2A2018] mb-4"
                style={{ fontFamily: "var(--font-instrument-serif)" }}
              >
                Follow us
              </h3>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/kinderhubapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#F3EADA] border border-[#EBDFC9] hover:border-[#D2592F]/40 text-[#5B4D3F] hover:text-[#2A2018] transition-colors text-sm font-medium"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none"/>
                  </svg>
                  Instagram
                </a>
                <a
                  href="https://www.facebook.com/kinderhubapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#F3EADA] border border-[#EBDFC9] hover:border-[#D2592F]/40 text-[#5B4D3F] hover:text-[#2A2018] transition-colors text-sm font-medium"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                  Facebook
                </a>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-[#F3EADA] rounded-2xl p-7 border border-[#EBDFC9] shadow-sm">
            <h2
              className="text-xl text-[#2A2018] mb-5"
              style={{ fontFamily: "var(--font-instrument-serif)" }}
            >
              Send us a message
            </h2>
            <form
              action="mailto:hello@kinderhub.app"
              method="GET"
              encType="text/plain"
              className="space-y-4"
            >
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-[#5B4D3F] mb-1.5"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                  Your name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Jane Smith"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EBDFC9] bg-[#F3EADA] text-[#2A2018] text-sm placeholder-[#C4B9AA] focus:outline-none focus:border-[#D2592F] transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-[#5B4D3F] mb-1.5"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="jane@kinderhub.app"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EBDFC9] bg-[#F3EADA] text-[#2A2018] text-sm placeholder-[#C4B9AA] focus:outline-none focus:border-[#D2592F] transition-colors"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-xs font-semibold text-[#5B4D3F] mb-1.5"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EBDFC9] bg-[#F3EADA] text-[#2A2018] text-sm focus:outline-none focus:border-[#D2592F] transition-colors"
                >
                  <option>Question about pricing</option>
                  <option>Technical support</option>
                  <option>Demo request</option>
                  <option>Partnership enquiry</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-xs font-semibold text-[#5B4D3F] mb-1.5"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="body"
                  rows={4}
                  required
                  placeholder="Tell us how we can help…"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EBDFC9] bg-[#F3EADA] text-[#2A2018] text-sm placeholder-[#C4B9AA] focus:outline-none focus:border-[#D2592F] transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#D2592F] hover:bg-[#b8441d] text-[#F3EADA] font-semibold py-3 rounded-full transition-colors text-sm"
              >
                Send Message →
              </button>
              <p className="text-xs text-[#C4B9AA] text-center leading-relaxed">
                This opens your email client. You can also reach us directly at{" "}
                <a href="mailto:hello@kinderhub.app" className="text-[#D2592F] hover:underline">
                  hello@kinderhub.app
                </a>
              </p>
            </form>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
