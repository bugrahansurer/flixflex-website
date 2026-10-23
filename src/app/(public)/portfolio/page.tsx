import type { Metadata } from "next"
import { PortfolioSection } from "@/components/public/sections/portfolio-section"
import { CTASection } from "@/components/public/sections/cta-section"
import { PortfolioHero } from "./_components/portfolio-hero"

import { getPageBySlug } from "@/lib/page-data"
import { PageRenderer } from "@/components/public/page-renderer"
import { listPublishedPortfolio } from "@/lib/content-store"

export const metadata: Metadata = {
  title: "Portfolyo — Reklam, Sosyal Medya ve Marka Projelerimiz",
  description:
    "Bursaspor, Pet Gourmet, Kurt Ofis ve daha fazlası: performans reklamcılığı, sosyal medya yönetimi ve marka kimliği alanlarında birlikte büyüttüğümüz markalar.",
  openGraph: {
    title: "FlixFlex Portfolyo",
    description:
      "Performans reklamcılığı, sosyal medya ve marka kimliği alanlarında birlikte büyüttüğümüz markalar.",
    url: "/portfolio",
    type: "website",
  },
  alternates: {
    canonical: "/portfolio",
  },
}

export const revalidate = 60

export default async function PortfolioPage() {
  const pageData = await getPageBySlug("portfolio")
  const portfolio = await listPublishedPortfolio()

  if (!pageData || pageData.sections.length === 0) {
    const totalProjects = portfolio.length
    const clientCount = new Set(portfolio.map((p) => p.client)).size
    const yearCount = new Set(portfolio.map((p) => p.year)).size
    const categoryCount = new Set(portfolio.map((p) => p.category)).size

    return (
      <>
        <PortfolioHero
          totalProjects={totalProjects}
          clientCount={clientCount}
          yearCount={yearCount}
          categoryCount={categoryCount}
        />
        <PortfolioSection items={portfolio} />
        <CTASection
          variant="dark"
          eyebrow="Sıradaki Projeniz"
          title={
            <>
              Bir sonraki{" "}
              <span className="text-[var(--ff-purple)]">vaka çalışması</span>{" "}
              sizin olsun.
            </>
          }
          description="Portföyümüzü beğendiyseniz, sizin projenizi de bu sayfaya taşıyalım. Brief'inizi paylaşın."
          primaryCTA={{ label: "Brief Gönder", href: "/iletisim" }}
          secondaryCTA={{ label: "Hizmetlerimiz", href: "/hizmetler" }}
        />
      </>
    )
  }

  return <PageRenderer sections={pageData.sections} portfolioItems={portfolio} />
}
