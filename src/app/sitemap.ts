import type { MetadataRoute } from "next"
import { SERVICES } from "@/components/public"
import { PORTFOLIO } from "@/components/public"

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "http://localhost:3000"

const STATIC_PAGES: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  priority: number
}> = [
  { path: "",            changeFrequency: "weekly",  priority: 1.0 },
  { path: "/hizmetler",  changeFrequency: "monthly", priority: 0.9 },
  { path: "/portfolio",  changeFrequency: "weekly",  priority: 0.9 },
  { path: "/blog",       changeFrequency: "daily",   priority: 0.8 },
  { path: "/hakkimizda", changeFrequency: "monthly", priority: 0.7 },
  { path: "/iletisim",   changeFrequency: "yearly",  priority: 0.6 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticEntries = STATIC_PAGES.map((p) => ({
    url: `${BASE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))

  const serviceEntries = SERVICES.map((service) => ({
    url: `${BASE_URL}/hizmetler/${service.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }))

  const portfolioEntries = PORTFOLIO.map((project) => ({
    url: `${BASE_URL}/portfolio/${project.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...staticEntries, ...serviceEntries, ...portfolioEntries]
}
