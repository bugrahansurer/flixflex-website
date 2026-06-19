// ═══════════════════════════════════════════════════════════
// FlixFlex Admin — Edit Page  /admin/sayfalar/[slug]/edit
// Server Component — fetches PageData and mounts PageBuilder
// ═══════════════════════════════════════════════════════════

import { notFound } from "next/navigation"
import { PageBuilder } from "@/components/admin/page-builder/page-builder"
import type { PageData } from "@/types/page-builder"

// ── Fetch page by slug ──────────────────────────────
async function fetchPage(slug: string): Promise<PageData | null> {
  const dbSlug = slug === "home" ? "/" : slug
  try {
    const { prisma } = await import("@/lib/prisma")
    if (prisma) {
      const p = await prisma.page.findUnique({ 
        where: { slug: dbSlug } 
      })

      if (!p) return null
      return {
        id:          p.id,
        slug:        p.slug,
        title:       p.title,
        description: p.description ?? undefined,
        sections:    (p.sections as unknown as PageData["sections"]) ?? [],
        status:      (p.isPublished ? "published" : "draft") as "published" | "draft",
        updatedAt:   p.updatedAt.toISOString(),
      }
    }
  } catch {
    // DB not available — fall through to in-memory
  }

  // In-memory fallback — call our own API route
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/pages`, {
      cache: "no-store",
    })
    if (!res.ok) return null
    const json = await res.json() as { success: boolean; data?: PageData[] }
    const pages = json.data ?? []
    const p = pages.find((page) => page.slug === dbSlug)
    return p ?? null
  } catch {
    // Return mock home page if all else fails
    if (slug === "home" || slug === "/") {
      return {
        id:        "home",
        slug:      "/",
        title:     "Ana Sayfa",
        description: "FlixFlex ana sayfası",
        sections:  [],
        status:    "published",
        updatedAt: new Date().toISOString(),
      }
    }
    return null
  }
}

// ── Page component ────────────────────────────────
type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function EditPageRoute({ params }: PageProps) {
  const { slug } = await params
  const page   = await fetchPage(slug)

  if (!page) notFound()

  return <PageBuilder initialPage={page} />
}
