import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

// Sitemap gerçek içerikten (veritabanı) üretilir: yayındaki hizmetler,
// portfolyo projeleri, blog yazıları ve admin'den yönetilen sayfalar
// (KVKK, kariyer vb.). Veritabanına ulaşılamazsa yalnızca sabit sayfalar döner.
export const revalidate = 3600

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "http://localhost:3000"

type Entry = MetadataRoute.Sitemap[number]

const STATIC_PAGES: Array<{ path: string; changeFrequency: Entry["changeFrequency"]; priority: number }> = [
  { path: "",            changeFrequency: "weekly",  priority: 1.0 },
  { path: "/hizmetler",  changeFrequency: "monthly", priority: 0.9 },
  { path: "/portfolio",  changeFrequency: "weekly",  priority: 0.8 },
  { path: "/blog",       changeFrequency: "daily",   priority: 0.8 },
  { path: "/hakkimizda", changeFrequency: "monthly", priority: 0.7 },
  { path: "/iletisim",   changeFrequency: "yearly",  priority: 0.7 },
]

// Kendi rotası olan ya da ana sayfa olan sayfa kayıtları (yukarıda zaten var)
const ROUTED_PAGE_SLUGS = new Set(["anasayfa", "hizmetler", "portfolio", "blog", "hakkimizda", "iletisim"])

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${BASE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))

  if (!prisma) return entries

  try {
    const [services, portfolio, posts, pages] = await Promise.all([
      prisma.service.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true, parentId: true } }),
      prisma.portfolioItem.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
      prisma.blogPost.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
      prisma.page.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    ])

    for (const s of services) {
      entries.push({ url: `${BASE_URL}/hizmetler/${s.slug}`, lastModified: s.updatedAt, changeFrequency: "monthly", priority: s.parentId ? 0.7 : 0.8 })
    }
    for (const p of portfolio) {
      entries.push({ url: `${BASE_URL}/portfolio/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly", priority: 0.6 })
    }
    for (const b of posts) {
      entries.push({ url: `${BASE_URL}/blog/${b.slug}`, lastModified: b.updatedAt, changeFrequency: "monthly", priority: 0.7 })
    }
    for (const pg of pages) {
      if (ROUTED_PAGE_SLUGS.has(pg.slug)) continue
      entries.push({ url: `${BASE_URL}/${pg.slug}`, lastModified: pg.updatedAt, changeFrequency: "yearly", priority: 0.3 })
    }
  } catch (err) {
    console.error("[sitemap] veritabanı okunamadı, yalnızca sabit sayfalar:", err)
  }

  return entries
}
