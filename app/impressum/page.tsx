import type { Metadata } from "next"
import Link from "next/link"
import PublicLayout from "@/app/components/landing/PublicLayout"

export const metadata: Metadata = {
  title: "Impressum — Legal Notice",
  description:
    "Kinderhub legal notice (Impressum) — company information, responsible person, and contact details as required by EU law.",
  alternates: { canonical: "https://kinderhub.app/impressum" },
  robots: { index: true, follow: false },
}

export default function ImpressumPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#F3EADA] px-4 sm:px-8 py-14 sm:py-20 text-center border-b border-[#EBDFC9]">
        <span
          className="inline-block text-xs tracking-widest text-[#D2592F] uppercase mb-4"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          Legal Notice
        </span>
        <h1
          className="text-4xl sm:text-5xl text-[#2A2018] leading-tight"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          Impressum
        </h1>
      </section>

      {/* Body */}
      <section className="bg-[#F3EADA] py-12 sm:py-16 px-4 sm:px-8">
        <div className="max-w-2xl mx-auto space-y-10 text-[#5B4D3F] text-sm leading-relaxed">

          <div>
            <h2 className="text-xl text-[#2A2018] mb-3" style={{ fontFamily: "var(--font-instrument-serif)" }}>
              Information according to § 5 TMG / EU Directive 2000/31/EC
            </h2>
            <div className="bg-[#EBDFC9] rounded-2xl p-5 space-y-2">
              <p className="font-semibold text-[#2A2018]">Kinderhub</p>
              <p>Platform for Kindergarten Management</p>
              <p>Europe (EU)</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl text-[#2A2018] mb-3" style={{ fontFamily: "var(--font-instrument-serif)" }}>
              Contact
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold text-[#2A2018]">Email:</span>{" "}
                <a href="mailto:hello@kinderhub.app" className="text-[#D2592F] hover:underline">
                  hello@kinderhub.app
                </a>
              </p>
              <p>
                <span className="font-semibold text-[#2A2018]">Website:</span>{" "}
                <a href="https://kinderhub.app" className="text-[#D2592F] hover:underline">
                  kinderhub.app
                </a>
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl text-[#2A2018] mb-3" style={{ fontFamily: "var(--font-instrument-serif)" }}>
              Responsible for content
            </h2>
            <p>Kinderhub Team</p>
            <p className="mt-1">
              For all content-related enquiries:{" "}
              <a href="mailto:hello@kinderhub.app" className="text-[#D2592F] hover:underline">
                hello@kinderhub.app
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-xl text-[#2A2018] mb-3" style={{ fontFamily: "var(--font-instrument-serif)" }}>
              Data Protection Officer
            </h2>
            <p>
              For data protection enquiries, contact:{" "}
              <a href="mailto:privacy@kinderhub.app" className="text-[#D2592F] hover:underline">
                privacy@kinderhub.app
              </a>
            </p>
            <p className="mt-2">
              See our full{" "}
              <Link href="/privacy-policy" className="text-[#D2592F] hover:underline">
                Privacy Policy
              </Link>{" "}
              for details on how we process personal data.
            </p>
          </div>

          <div>
            <h2 className="text-xl text-[#2A2018] mb-3" style={{ fontFamily: "var(--font-instrument-serif)" }}>
              Disclaimer
            </h2>
            <h3 className="font-semibold text-[#2A2018] mb-1">Liability for content</h3>
            <p>
              The contents of our website have been created with the greatest care. However, we cannot guarantee
              the accuracy, completeness, or timeliness of the content. As a service provider we are responsible
              for our own content on these pages in accordance with general laws.
            </p>
            <h3 className="font-semibold text-[#2A2018] mt-4 mb-1">Liability for links</h3>
            <p>
              Our website contains links to external websites over which we have no control. We therefore cannot
              accept any liability for these external contents. The respective provider or operator of the linked
              pages is always responsible for the content of those pages.
            </p>
            <h3 className="font-semibold text-[#2A2018] mt-4 mb-1">Copyright</h3>
            <p>
              The content and works on these pages created by the site operators are subject to European copyright
              law. Duplication, processing, distribution, or any form of commercialisation of such material beyond
              the scope of the copyright law shall require the prior written consent of its respective author or creator.
            </p>
          </div>

          <div className="pt-6 border-t border-[#EBDFC9]">
            <Link href="/contact" className="text-[#D2592F] hover:underline text-sm font-medium">
              ← Back to Contact
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
