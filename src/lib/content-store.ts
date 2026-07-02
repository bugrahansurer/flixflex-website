import { cache } from "react"
import type { Prisma } from "@prisma/client"
import prisma from "@/lib/prisma"
import {
  PORTFOLIO,
  type PortfolioItem as PublicPortfolioItem,
} from "@/components/public/sections/portfolio-data"
import {
  SERVICES as RAW_SERVICES,
  type Service as PublicService,
} from "@/components/public/sections/services-data"
import {
  POSTS as BLOG_POSTS,
  getPost as getStaticPost,
  type BlogPost as PublicBlogPost,
} from "@/components/public/blog/blog-data"

// Strip React component icons — only plain objects can cross Server→Client boundary
const SERVICES = RAW_SERVICES.map(({ icon, ...rest }) => rest)

type PortfolioWithServices = Prisma.PortfolioItemGetPayload<{
  include: { services: true }
}>

type ServiceMapInput = {
  id: string
  slug: string
  title: string
  description: string | null
  body: string | null
  icon: string | null
  features: unknown
  processSteps: unknown
  deliverables: unknown
  parentId: string | null
  children?: ServiceMapInput[]
  portfolios?: PortfolioWithServices[]
  coverImage?: string | null
  accentColor?: string | null
  gradient?: string | null
  motionDesign?: string | null
}

const DEFAULT_GRADIENT = "from-[#1A1A1A] via-[#2A1A3A] to-[#3D1A5C]"
const DEFAULT_ACCENT = "var(--ff-purple)"

function asStringArray(value: unknown, fallback: string[] = []): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : fallback
}

function asSidebarItems(value: unknown): PublicPortfolioItem["sidebarItems"] {
  if (!Array.isArray(value)) return undefined
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const record = item as Record<string, unknown>
      const heading = String(record.heading ?? "").trim()
      const body = String(record.body ?? "").trim()
      return heading && body ? { heading, body } : null
    })
    .filter(Boolean) as PublicPortfolioItem["sidebarItems"]
}

function asResultStats(value: unknown): PublicPortfolioItem["resultStats"] {
  if (!Array.isArray(value)) return undefined
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const record = item as Record<string, unknown>
      const valueNumber = Number(record.value)
      const label = String(record.label ?? "").trim()
      if (!Number.isFinite(valueNumber) || !label) return null
      return {
        value: valueNumber,
        suffix: typeof record.suffix === "string" ? record.suffix : undefined,
        prefix: typeof record.prefix === "string" ? record.prefix : undefined,
        label,
        description:
          typeof record.description === "string" ? record.description : undefined,
      }
    })
    .filter(Boolean) as PublicPortfolioItem["resultStats"]
}

export function mapPortfolio(item: PortfolioWithServices): PublicPortfolioItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    client: item.client ?? "FlixFlex",
    clientLogo: item.clientLogo,
    year: item.year ?? new Date().getFullYear(),
    category: item.category,
    description: item.description ?? "",
    linkUrl: item.linkUrl,
    linkLabel: item.linkLabel,
    coverImage: item.coverImage,
    images: item.images,
    gradient: item.gradient || DEFAULT_GRADIENT,
    accentColor: item.accentColor || DEFAULT_ACCENT,
    tall: item.tall,
    narrativeParagraphs: asStringArray(item.narrativeParagraphs),
    sidebarItems: asSidebarItems(item.sidebarItems),
    resultStats: asResultStats(item.resultStats),
    serviceSlugs: item.services.map((service) => service.slug),
  }
}

export function mapService(item: ServiceMapInput, depth: number = 0): PublicService {
  const MAX_DEPTH = 3
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    description: item.description ?? "",
    body: item.body ?? "",
    iconKey: item.icon ?? undefined,
    features: Array.isArray(item.features)
      ? item.features.filter((f): f is string => typeof f === "string")
      : [],
    processSteps: Array.isArray(item.processSteps)
      ? (item.processSteps as unknown as PublicService["processSteps"])
      : [],
    deliverables: asStringArray(item.deliverables),
    parentId: item.parentId ?? undefined,
    coverImage: item.coverImage || null,
    accentColor: item.accentColor || null,
    gradient: item.gradient || null,
    motionDesign: item.motionDesign ?? null,
    children: depth < MAX_DEPTH && item.children?.length
      ? item.children.map((child) => mapService(child, depth + 1))
      : [],
    subServices: depth < MAX_DEPTH && item.children?.length
      ? item.children.map((child) => ({
          label: child.title,
          href: `/hizmetler/${child.slug}`,
          iconKey: child.icon ?? "Globe",
          description: child.description ?? "",
          motionDesign: child.motionDesign ?? null,
        }))
      : [],
    relatedPortfolio: item.portfolios
      ? item.portfolios
          .filter((portfolio) => portfolio.isPublished)
          .sort((a, b) => a.order - b.order)
          .map(mapPortfolio)
      : [],
  }
}

export const listPublishedPortfolio = cache(async (): Promise<PublicPortfolioItem[]> => {
  if (!prisma) return PORTFOLIO

  try {
    const rows = await prisma.portfolioItem.findMany({
      where: { isPublished: true },
      include: { services: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 200,
    })

    // DB başarılıysa gerçek sonucu döndür (boşsa boş) — statik demo maskesi yok.
    // Statik fallback yalnızca DB hatasında (catch) devreye girer.
    return rows.map(mapPortfolio)
  } catch (err) {
    console.error('[listPublishedPortfolio] DB error:', err)
    return PORTFOLIO
  }
})

export const getPublishedPortfolioBySlug = cache(async (
  slug: string,
): Promise<PublicPortfolioItem | null> => {
  if (!prisma) return PORTFOLIO.find((item) => item.slug === slug) ?? null

  try {
    const row = await prisma.portfolioItem.findUnique({
      where: { slug },
      include: { services: true },
    })

    if (!row || !row.isPublished) {
      return PORTFOLIO.find((item) => item.slug === slug) ?? null
    }

    return mapPortfolio(row)
  } catch (err) {
    console.error('[getPublishedPortfolioBySlug] DB error:', err)
    return PORTFOLIO.find((item) => item.slug === slug) ?? null
  }
})

export const listPublishedServices = cache(async (): Promise<PublicService[]> => {
  if (!prisma) return SERVICES

  try {
    const rows = await prisma.service.findMany({
      where: { isPublished: true },
      include: {
        portfolios: { include: { services: true } },
        children: true,
        parent: { select: { id: true, title: true } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      take: 300,
    })

    return rows.map(mapService)
  } catch (err) {
    console.error('[listPublishedServices] DB error:', err)
    return SERVICES
  }
})

export const listPublishedChildServices = cache(async (): Promise<PublicService[]> => {
  if (!prisma) return SERVICES

  try {
    const rows = await prisma.service.findMany({
      where: { isPublished: true, parentId: { not: null } },
      include: {
        portfolios: { include: { services: true } },
        children: true,
        parent: { select: { id: true, title: true } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      take: 300,
    })

    return rows.map(mapService)
  } catch (err) {
    console.error('[listPublishedChildServices] DB error:', err)
    return SERVICES
  }
})

export const listPublishedMainServices = cache(async (): Promise<PublicService[]> => {
  if (!prisma) return SERVICES.filter((s) => !s.parentId)

  try {
    const rows = await prisma.service.findMany({
      where: { isPublished: true, parentId: null },
      include: {
        portfolios: { include: { services: true } },
        children: {
          where: { isPublished: true },
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
        parent: { select: { id: true, title: true } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      take: 100,
    })

    return rows.map((item) => mapService(item))
  } catch (err) {
    console.error('[listPublishedMainServices] DB error:', err)
    return SERVICES.filter((s) => !s.parentId)
  }
})

// ── Blog ──────────────────────────────────────────
const DEFAULT_BLOG_GRADIENT =
  "from-[var(--ff-purple)]/30 via-[var(--ff-purple)]/20 to-[var(--foreground)]"

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "FF"
  if (parts.length === 1) return (parts[0][0] + (parts[0][1] ?? "")).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

type BlogRow = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  coverGradient: string | null
  template: string
  category: string | null
  tags: string[]
  author: string | null
  readTime: number
  publishedAt: Date | null
  createdAt: Date
}

function mapBlogPost(row: BlogRow): PublicBlogPost {
  const author = row.author?.trim() || "FlixFlex"
  const template = ["classic", "editorial", "visual"].includes(row.template)
    ? (row.template as PublicBlogPost["template"])
    : "classic"
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    content: row.content,
    coverImage: row.coverImage ?? null,
    coverGradient: row.coverGradient ?? DEFAULT_BLOG_GRADIENT,
    template,
    category: row.category ?? "Genel",
    tags: Array.isArray(row.tags) ? row.tags : [],
    author: { name: author, role: "", initials: deriveInitials(author) },
    readMinutes: row.readTime ?? 5,
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString().slice(0, 10),
  }
}

export const listPublishedBlogPosts = cache(async (): Promise<PublicBlogPost[]> => {
  if (!prisma) return BLOG_POSTS

  try {
    const rows = await prisma.blogPost.findMany({
      where: { status: "published" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 300,
    })
    return rows.map(mapBlogPost)
  } catch (err) {
    console.error("[listPublishedBlogPosts] DB error:", err)
    return BLOG_POSTS
  }
})

export const getPublishedBlogBySlug = cache(async (slug: string): Promise<PublicBlogPost | null> => {
  if (!prisma) return getStaticPost(slug) ?? null

  try {
    const row = await prisma.blogPost.findUnique({ where: { slug } })
    if (!row || row.status !== "published") return getStaticPost(slug) ?? null
    return mapBlogPost(row)
  } catch (err) {
    console.error("[getPublishedBlogBySlug] DB error:", err)
    return getStaticPost(slug) ?? null
  }
})

export async function getFeaturedBlogPost(): Promise<PublicBlogPost> {
  const all = await listPublishedBlogPosts()
  return all[0]
}

export async function listRelatedBlogPosts(
  slug: string,
  n = 3,
  category?: string | null,
): Promise<PublicBlogPost[]> {
  if (!prisma) return BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, n)

  try {
    const base = { status: "published", slug: { not: slug } }
    // Same-category first (capped), then fill from others — two small queries
    // instead of loading the whole table.
    const same = category
      ? await prisma.blogPost.findMany({
          where: { ...base, category },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: n,
        })
      : []
    const remaining = n - same.length
    const others =
      remaining > 0
        ? await prisma.blogPost.findMany({
            where: { ...base, ...(category ? { category: { not: category } } : {}) },
            orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
            take: remaining,
          })
        : []
    return [...same, ...others].map(mapBlogPost)
  } catch (err) {
    console.error("[listRelatedBlogPosts] DB error:", err)
    return BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, n)
  }
}

export async function getPublishedServiceBySlug(
  slug: string,
): Promise<PublicService & { children?: PublicService[]; parentId?: string | null } | null> {
  if (!prisma) return SERVICES.find((item) => item.slug === slug) ?? null

  try {
    const row = await prisma.service.findUnique({
      where: { slug },
      include: {
        portfolios: { include: { services: true } },
        children: {
      where: { isPublished: true },
          include: {
            portfolios: { include: { services: true } },
          },
          orderBy: { order: "asc" },
        },
        parent: { select: { id: true, title: true } },
      },
    })

    if (!row || !row.isPublished) {
      return SERVICES.find((item) => item.slug === slug) ?? null
    }

    const service = mapService(row)
    return {
      ...service,
      parentId: row.parentId,
      children: row.children.length > 0 ? row.children.map((c) => mapService(c)) : undefined,
    }
  } catch (err) {
    console.error('[getPublishedServiceBySlug] DB error:', err)
    return SERVICES.find((item) => item.slug === slug) ?? null
  }
}
