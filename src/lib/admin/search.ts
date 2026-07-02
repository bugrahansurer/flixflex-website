// ═══════════════════════════════════════════════════════════
// FlixFlex — Global admin araması
//
// Verilen anahtar kelimeyi admin panelindeki tüm ana içerik
// türlerinde arar (portföy, hizmet, sayfa, blog, kullanıcı, rol,
// mesaj). Yalnızca kullanıcının okuma izni olan kaynaklar sorgulanır.
// Her sorgu ayrı try/catch ile korunur — DB kesintisi tüm aramayı
// düşürmez.
// ═══════════════════════════════════════════════════════════

import prisma from "@/lib/prisma"
import { RESOURCE_LABELS } from "@/lib/rbac/resources"

export interface SearchResultItem {
  id: string
  title: string
  subtitle?: string
  href: string
}

export interface SearchGroup {
  resource: string
  label: string
  items: SearchResultItem[]
}

const PER_TYPE = 6
const insensitive = "insensitive" as const

function truncate(value: string | null | undefined, len = 70): string | undefined {
  if (!value) return undefined
  const clean = value.replace(/\s+/g, " ").trim()
  return clean.length > len ? `${clean.slice(0, len)}…` : clean
}

/**
 * `allowed` — kullanıcının okuma izni olan kaynak anahtarları kümesi.
 * Boş sonuç veren gruplar döndürülmez.
 */
export async function searchAdmin(
  rawQuery: string,
  allowed: Set<string>,
): Promise<SearchGroup[]> {
  const q = rawQuery.trim()
  if (!prisma || q.length < 2) return []

  const groups: SearchGroup[] = []
  const can = (r: string) => allowed.has(r)

  const push = (resource: string, items: SearchResultItem[]) => {
    if (items.length > 0) {
      groups.push({ resource, label: RESOURCE_LABELS[resource] || resource, items })
    }
  }

  await Promise.all([
    // ── Portföy ──────────────────────────────────────────
    (async () => {
      if (!can("portfolio")) return
      try {
        const rows = await prisma!.portfolioItem.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: insensitive } },
              { client: { contains: q, mode: insensitive } },
              { category: { contains: q, mode: insensitive } },
              { description: { contains: q, mode: insensitive } },
            ],
          },
          select: { slug: true, title: true, client: true, category: true },
          take: PER_TYPE,
          orderBy: { updatedAt: "desc" },
        })
        push("portfolio", rows.map((r) => ({
          id: r.slug,
          title: r.title,
          subtitle: [r.client, r.category].filter(Boolean).join(" · ") || undefined,
          href: `/admin/portfolyo/${r.slug}`,
        })))
      } catch (err) { console.error("[adminSearch] portfolio:", err) }
    })(),

    // ── Hizmetler ────────────────────────────────────────
    (async () => {
      if (!can("services")) return
      try {
        const rows = await prisma!.service.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: insensitive } },
              { description: { contains: q, mode: insensitive } },
            ],
          },
          select: { slug: true, title: true, description: true },
          take: PER_TYPE,
          orderBy: { updatedAt: "desc" },
        })
        push("services", rows.map((r) => ({
          id: r.slug,
          title: r.title,
          subtitle: truncate(r.description),
          href: `/admin/hizmetler/${r.slug}`,
        })))
      } catch (err) { console.error("[adminSearch] services:", err) }
    })(),

    // ── Sayfalar ─────────────────────────────────────────
    (async () => {
      if (!can("pages")) return
      try {
        const rows = await prisma!.page.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: insensitive } },
              { slug: { contains: q, mode: insensitive } },
              { description: { contains: q, mode: insensitive } },
            ],
          },
          select: { slug: true, title: true },
          take: PER_TYPE,
          orderBy: { updatedAt: "desc" },
        })
        push("pages", rows.map((r) => ({
          id: r.slug,
          title: r.title,
          subtitle: `/${r.slug}`,
          href: `/admin/sayfalar/${r.slug}/edit`,
        })))
      } catch (err) { console.error("[adminSearch] pages:", err) }
    })(),

    // ── Blog ─────────────────────────────────────────────
    (async () => {
      if (!can("blog")) return
      try {
        const rows = await prisma!.blogPost.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: insensitive } },
              { excerpt: { contains: q, mode: insensitive } },
              { category: { contains: q, mode: insensitive } },
              { content: { contains: q, mode: insensitive } },
            ],
          },
          select: { slug: true, title: true, category: true, status: true },
          take: PER_TYPE,
          orderBy: { updatedAt: "desc" },
        })
        push("blog", rows.map((r) => ({
          id: r.slug,
          title: r.title,
          subtitle: [r.category, r.status === "published" ? "Yayında" : "Taslak"].filter(Boolean).join(" · ") || undefined,
          href: `/admin/blog/${r.slug}`,
        })))
      } catch (err) { console.error("[adminSearch] blog:", err) }
    })(),

    // ── Kullanıcılar ─────────────────────────────────────
    (async () => {
      if (!can("users")) return
      try {
        const rows = await prisma!.user.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: insensitive } },
              { email: { contains: q, mode: insensitive } },
              { username: { contains: q, mode: insensitive } },
            ],
          },
          select: { id: true, name: true, email: true, username: true },
          take: PER_TYPE,
          orderBy: { createdAt: "desc" },
        })
        push("users", rows.map((r) => ({
          id: r.id,
          title: r.name || r.username,
          subtitle: r.email,
          href: "/admin/kullanicilar",
        })))
      } catch (err) { console.error("[adminSearch] users:", err) }
    })(),

    // ── Roller ───────────────────────────────────────────
    (async () => {
      if (!can("roles")) return
      try {
        const rows = await prisma!.role.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: insensitive } },
              { description: { contains: q, mode: insensitive } },
            ],
          },
          select: { id: true, name: true, description: true },
          take: PER_TYPE,
          orderBy: { createdAt: "desc" },
        })
        push("roles", rows.map((r) => ({
          id: r.id,
          title: r.name,
          subtitle: truncate(r.description),
          href: "/admin/roller",
        })))
      } catch (err) { console.error("[adminSearch] roles:", err) }
    })(),

    // ── Mesajlar ─────────────────────────────────────────
    (async () => {
      if (!can("messages")) return
      try {
        const rows = await prisma!.contactSubmission.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: insensitive } },
              { email: { contains: q, mode: insensitive } },
              { company: { contains: q, mode: insensitive } },
              { message: { contains: q, mode: insensitive } },
            ],
          },
          select: { id: true, name: true, email: true, message: true },
          take: PER_TYPE,
          orderBy: { createdAt: "desc" },
        })
        push("messages", rows.map((r) => ({
          id: r.id,
          title: r.name,
          subtitle: truncate(r.message) || r.email,
          href: "/admin/mesajlar",
        })))
      } catch (err) { console.error("[adminSearch] messages:", err) }
    })(),
  ])

  return groups
}
