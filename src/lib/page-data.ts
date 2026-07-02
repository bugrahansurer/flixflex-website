import { cache } from "react"
import { prisma } from "@/lib/prisma"
import type { PageData, SectionBlock } from "@/types/page-builder"

// Request-level dedupe: aynı sayfa hem generateMetadata'da hem render'da
// istendiğinde DB'ye tek sorgu gider.
export const getPageBySlug = cache(async (slug: string): Promise<PageData | null> => {
  if (!prisma) return null

  try {
    const page = await prisma.page.findUnique({
      where: { slug, isPublished: true },
    })

    if (!page) return null

    return {
      id:          page.id,
      slug:        page.slug,
      title:       page.title,
      description: page.description ?? undefined,
      sections:    (page.sections as unknown as SectionBlock[]) ?? [],
      status:      page.isPublished ? "published" : "draft",
      updatedAt:   page.updatedAt.toISOString(),
    }
  } catch (err) {
    console.error(`[getPageBySlug] Error fetching page ${slug}:`, err)
    return null
  }
})
