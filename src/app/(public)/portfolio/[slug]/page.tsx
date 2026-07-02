import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CTASection, PORTFOLIO } from "@/components/public"
import { listPublishedPortfolio, getPublishedPortfolioBySlug } from "@/lib/content-store"
import { ProjectHero } from "./_components/project-hero"
import { ProjectCover } from "./_components/project-cover"
import { ProjectNarrative } from "./_components/project-narrative"
import { ProjectGallerySection } from "./_components/project-gallery-section"
import { ProjectResults } from "./_components/project-results"
import { PrevNextNav } from "@/components/public/portfolio/prev-next"

// ── Static params ─────────────────────────────────

export const revalidate = 60

export function generateStaticParams() {
  return PORTFOLIO.map((item) => ({ slug: item.slug }))
}

// ── Metadata ──────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getPublishedPortfolioBySlug(slug)

  if (!project) {
    return { title: "Proje Bulunamadı — FlixFlex" }
  }

  return {
    title: `${project.title} — ${project.client} | FlixFlex Portfolyo`,
    description: project.description,
    openGraph: {
      title: `${project.title} — ${project.client}`,
      description: project.description,
      url: `https://flixflex.com/portfolio/${slug}`,
      type: "article",
    },
    alternates: {
      canonical: `https://flixflex.com/portfolio/${slug}`,
    },
  }
}

// ── Page ──────────────────────────────────────────

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const portfolio = await listPublishedPortfolio()
  const projectIndex = portfolio.findIndex((p) => p.slug === slug)

  if (projectIndex === -1) {
    notFound()
  }

  // projectIndex is guaranteed ≥ 0 here — notFound() throws above
  const project = portfolio[projectIndex]!
  const total = portfolio.length

  // Wrap-around prev/next
  const prev = portfolio[(projectIndex - 1 + total) % total]
  const next = portfolio[(projectIndex + 1) % total]

  // Prevent linking to self when there's only one item
  const prevItem = total > 1 && prev.slug !== slug ? prev : null
  const nextItem = total > 1 && next.slug !== slug ? next : null

  return (
    <>
      <ProjectHero project={project} />
      <ProjectCover project={project} />
      <ProjectNarrative project={project} />
      <ProjectGallerySection project={project} />
      <ProjectResults project={project} />
      <PrevNextNav prev={prevItem} next={nextItem} />
      <CTASection
        variant="dark"
        eyebrow="Benzer Bir Proje"
        title={
          <>
            Markanız için{" "}
            <span className="text-[var(--ff-purple)]">aynı sonuçları</span>{" "}
            elde edelim.
          </>
        }
        description="Bu projeyi beğendiyseniz, sizin için de benzer bir başarı hikâyesi yazabiliriz. Brief'inizi paylaşın."
        primaryCTA={{ label: "Projenizi Anlatın", href: "/iletisim" }}
        secondaryCTA={{ label: "Tüm Projeler", href: "/portfolio" }}
      />
    </>
  )
}
