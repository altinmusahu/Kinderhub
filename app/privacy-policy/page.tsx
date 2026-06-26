import type { Metadata } from "next"
import Link from "next/link"
import PublicLayout from "@/app/components/landing/PublicLayout"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Kinderhub Privacy Policy — how we collect, store, and protect your personal data in accordance with GDPR and EU data protection law.",
  alternates: { canonical: "https://kinderhub.app/privacy-policy" },
  robots: { index: true, follow: false },
}

const LAST_UPDATED = "1 June 2025"

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#F3EADA] px-4 sm:px-8 py-14 sm:py-20 text-center border-b border-[#EBDFC9]">
        <span
          className="inline-block text-xs tracking-widest text-[#D2592F] uppercase mb-4"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          Legal
        </span>
        <h1
          className="text-4xl sm:text-5xl text-[#2A2018] leading-tight"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          Privacy Policy
        </h1>
        <p className="text-[#5B4D3F] mt-3 text-sm"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
          Last updated: {LAST_UPDATED}
        </p>
      </section>

      {/* Body */}
      <section className="bg-[#F3EADA] py-12 sm:py-16 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto prose-kinderhub space-y-10 text-[#5B4D3F] text-sm leading-relaxed">

          <div>
            <h2 className="text-xl text-[#2A2018] mb-3" style={{ fontFamily: "var(--font-instrument-serif)" }}>
              1. Who we are
            </h2>
            <p>
              Kinderhub (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the kindergarten management platform available at{" "}
              <a href="https://kinderhub.app" className="text-[#D2592F] hover:underline">kinderhub.app</a>.
              We are the data controller for the personal data processed through this platform.
              For questions about this policy, contact us at{" "}
              <a href="mailto:privacy@kinderhub.app" className="text-[#D2592F] hover:underline">privacy@kinderhub.app</a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl text-[#2A2018] mb-3" style={{ fontFamily: "var(--font-instrument-serif)" }}>
              2. What data we collect
            </h2>
            <p>We collect the following categories of personal data:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><strong className="text-[#2A2018]">Account data:</strong> name, email address, and password (hashed) when you create an account.</li>
              <li><strong className="text-[#2A2018]">Organisation data:</strong> kindergarten name, address, and billing information.</li>
              <li><strong className="text-[#2A2018]">Child records:</strong> name, date of birth, medical notes, and allergy information provided by your school.</li>
              <li><strong className="text-[#2A2018]">Family data:</strong> parent/guardian names, contact details, and authorised pickup information.</li>
              <li><strong className="text-[#2A2018]">Staff data:</strong> name, email, role, and qualification records.</li>
              <li><strong className="text-[#2A2018]">Usage data:</strong> anonymised analytics on how the platform is used (via Vercel Analytics — no cookies required).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl text-[#2A2018] mb-3" style={{ fontFamily: "var(--font-instrument-serif)" }}>
              3. How we use your data
            </h2>
            <p>We process personal data for the following purposes:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>To provide and operate the Kinderhub platform (contractual necessity).</li>
              <li>To send billing invoices and payment reminders (contractual necessity).</li>
              <li>To send service-related emails such as password resets (legitimate interest).</li>
              <li>To improve platform performance and detect issues (legitimate interest).</li>
              <li>To comply with legal obligations under EU law.</li>
            </ul>
            <p className="mt-3">We do not use your data for advertising or sell it to third parties.</p>
          </div>

          <div>
            <h2 className="text-xl text-[#2A2018] mb-3" style={{ fontFamily: "var(--font-instrument-serif)" }}>
              4. Data storage and security
            </h2>
            <p>
              All data is stored on EU servers (Supabase, Frankfurt region). We implement the following security measures:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Encryption at rest (AES-256).</li>
              <li>Encryption in transit (TLS 1.3).</li>
              <li>Role-based access control — staff only access data relevant to their role.</li>
              <li>Automated daily backups with 30-day retention.</li>
              <li>Audit logs for all data access events.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl text-[#2A2018] mb-3" style={{ fontFamily: "var(--font-instrument-serif)" }}>
              5. Data retention
            </h2>
            <p>
              We retain personal data for as long as your subscription is active and for up to 30 days after cancellation,
              during which you can export your data. After 30 days, data is deleted from our systems unless we are required
              to retain it for legal reasons.
            </p>
          </div>

          <div>
            <h2 className="text-xl text-[#2A2018] mb-3" style={{ fontFamily: "var(--font-instrument-serif)" }}>
              6. Your rights under GDPR
            </h2>
            <p>As a data subject in the EU, you have the following rights:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><strong className="text-[#2A2018]">Access:</strong> request a copy of the personal data we hold about you.</li>
              <li><strong className="text-[#2A2018]">Rectification:</strong> request correction of inaccurate data.</li>
              <li><strong className="text-[#2A2018]">Erasure:</strong> request deletion of your data (&ldquo;right to be forgotten&rdquo;).</li>
              <li><strong className="text-[#2A2018]">Portability:</strong> receive your data in a machine-readable format.</li>
              <li><strong className="text-[#2A2018]">Objection:</strong> object to processing based on legitimate interest.</li>
              <li><strong className="text-[#2A2018]">Restriction:</strong> request restricted processing in certain circumstances.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact{" "}
              <a href="mailto:privacy@kinderhub.app" className="text-[#D2592F] hover:underline">privacy@kinderhub.app</a>.
              We will respond within 30 days.
            </p>
          </div>

          <div>
            <h2 className="text-xl text-[#2A2018] mb-3" style={{ fontFamily: "var(--font-instrument-serif)" }}>
              7. Cookies
            </h2>
            <p>
              Kinderhub uses a single session cookie for authentication purposes only. We do not use advertising,
              tracking, or third-party marketing cookies. Our analytics are handled by Vercel Analytics, which uses
              no cookies and processes anonymised data only.
            </p>
          </div>

          <div>
            <h2 className="text-xl text-[#2A2018] mb-3" style={{ fontFamily: "var(--font-instrument-serif)" }}>
              8. Third-party processors
            </h2>
            <p>We share data with the following sub-processors, all of which are GDPR-compliant and covered by EU Standard Contractual Clauses:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><strong className="text-[#2A2018]">Supabase Inc.</strong> — database and authentication (EU region).</li>
              <li><strong className="text-[#2A2018]">Vercel Inc.</strong> — hosting and anonymised analytics.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl text-[#2A2018] mb-3" style={{ fontFamily: "var(--font-instrument-serif)" }}>
              9. Changes to this policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify subscribers by email at least 30 days
              before any material change takes effect. Continued use of the platform after that date constitutes
              acceptance of the updated policy.
            </p>
          </div>

          <div className="pt-6 border-t border-[#EBDFC9]">
            <p>
              For any privacy-related questions, email{" "}
              <a href="mailto:privacy@kinderhub.app" className="text-[#D2592F] hover:underline">privacy@kinderhub.app</a>.
              {" "}You can also{" "}
              <Link href="/contact" className="text-[#D2592F] hover:underline">contact us via the contact form</Link>.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
