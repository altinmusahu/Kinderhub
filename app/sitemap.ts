import type { MetadataRoute } from "next"

const BASE = "https://kinderhub.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/modules`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/impressum`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ]

  return staticRoutes
}
