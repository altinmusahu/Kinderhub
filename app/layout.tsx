import type { Metadata } from "next"
import { Geist, Geist_Mono, Instrument_Serif, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

const SITE_URL = "https://kinderhub.app"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kinderhub — Kindergarten Management Software",
    template: "%s | Kinderhub",
  },
  description:
    "Kinderhub is the all-in-one kindergarten management platform. Handle attendance, parent communication, staff management, billing, and reporting — built for early childhood educators.",
  keywords: [
    "kindergarten management software",
    "daycare management app",
    "childcare software",
    "preschool management",
    "attendance tracking kids",
    "parent communication app school",
    "GDPR childcare software",
    "early childhood education platform",
    "kindergarten billing software",
    "staff management preschool",
  ],
  authors: [{ name: "Kinderhub", url: SITE_URL }],
  creator: "Kinderhub",
  publisher: "Kinderhub",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Kinderhub",
    title: "Kinderhub — Kindergarten Management Software",
    description:
      "The all-in-one platform for kindergartens. Attendance, communication, billing, reports — all in one place.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Kinderhub dashboard preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kinderhub — Kindergarten Management Software",
    description:
      "The all-in-one platform for kindergartens. Attendance, communication, billing, reports — all in one place.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/app-icon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: { canonical: SITE_URL },
}

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Kinderhub",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description:
    "All-in-one kindergarten management software for attendance, parent communication, billing, and reporting.",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "29",
    highPrice: "199",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "320",
  },
  publisher: {
    "@type": "Organization",
    name: "Kinderhub",
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/app-icon.svg` },
    sameAs: [
      "https://www.instagram.com/kinderhubapp",
      "https://www.facebook.com/kinderhubapp",
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="org-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className={`${geistSans.className} min-h-full bg-background text-foreground`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}