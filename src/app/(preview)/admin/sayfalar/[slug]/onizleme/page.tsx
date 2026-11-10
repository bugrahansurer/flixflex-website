// ═══════════════════════════════════════════════════════════
// FlixFlex — Canlı önizleme  /admin/sayfalar/[slug]/onizleme
// Sayfanın gerçek rotasını çizer; bölümler düzenleyiciden canlı gelir
// (PreviewBridge). Erişim: middleware /admin/sayfalar → "pages" yetkisi.
// ═══════════════════════════════════════════════════════════

import { notFound, redirect } from "next/navigation"
import type { ComponentType } from "react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { listPublishedPortfolio } from "@/lib/content-store"
import { PageRenderer } from "@/components/public/page-renderer"
import type { SectionBlock } from "@/types/page-builder"
import HomePage from "@/app/(public)/page"
import BlogPage from "@/app/(public)/blog/page"
import HakkimizdaPage from "@/app/(public)/hakkimizda/page"
import HizmetlerPage from "@/app/(public)/hizmetler/page"
import IletisimPage from "@/app/(public)/iletisim/page"
import PortfolioPage from "@/app/(public)/portfolio/page"

export const dynamic = "force-dynamic"

/** Kendi rotası olan sayfalar: önizleme o rotanın tamamını gösterir */
const DEDICATED_ROUTES: Record<string, ComponentType> = {
  anasayfa: HomePage,
  blog: BlogPage,
  hakkimizda: HakkimizdaPage,
  hizmetler: HizmetlerPage,
  iletisim: IletisimPage,
  portfolio: PortfolioPage,
}

type Props = { params: Promise<{ slug: string }> }

export default async function PagePreview({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect("/giris")

  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const dbSlug = slug === "home" ? "/" : slug
  if (!prisma) notFound()

  const page = await prisma.page.findUnique({ where: { slug: dbSlug } })
  if (!page) notFound()

  const sections = (page.sections as unknown as SectionBlock[]) ?? []
  const Dedicated = DEDICATED_ROUTES[page.slug]

  // Kendi rotası yalnızca yayındaki ve bölümü olan sayfayı çizer; taslakta
  // ya da boş sayfada genel şablon kullanılır ki düzenleyicideki bölümler görünsün.
  if (Dedicated && page.isPublished && sections.length > 0) return <Dedicated />

  const portfolioItems = await listPublishedPortfolio().catch(() => [])
  return (
    <div className="min-h-screen pt-20">
      <PageRenderer sections={sections} portfolioItems={portfolioItems} />
    </div>
  )
}
