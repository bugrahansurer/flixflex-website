import type { Metadata } from "next"
import {
  ManifestoSection,
  StorySection,
  ValuesSection,
  TeamSection,
  WhyUsSection,
} from "@/components/public/about"

import { getPageBySlug } from "@/lib/page-data"
import { listPublishedPortfolio } from "@/lib/content-store"
import { PageRenderer } from "@/components/public/page-renderer"

export const metadata: Metadata = {
  title: "Hakkımızda — Tarsus, Mersin Merkezli Dijital Reklam Ajansı",
  description:
    "FlixFlex'in hikâyesi, ekibi ve değerleri. 2020'den bu yana Tarsus, Mersin merkezli; Türkiye genelinde markalara performans pazarlaması, sosyal medya ve marka kimliği hizmeti veren yeni nesil reklam ajansı.",
  openGraph: { url: "/hakkimizda", type: "website" },
  alternates: { canonical: "/hakkimizda" },
}

export default async function HakkimizdaPage() {
  const portfolioItems = await listPublishedPortfolio();
  const pageData = await getPageBySlug("hakkimizda")

  if (!pageData || pageData.sections.length === 0) {
    return (
      <>
        <ManifestoSection />
        <StorySection />
        <ValuesSection />
        <TeamSection />
        <WhyUsSection />
      </>
    )
  }

  return <PageRenderer sections={pageData.sections} portfolioItems={portfolioItems} />
}
