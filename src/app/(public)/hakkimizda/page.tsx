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
  title: "Hakkımızda — FlixFlex",
  description:
    "FlixFlex'in hikâyesi, ekibi, değerleri ve rakiplerden nasıl ayrıştığı. 2020'den bu yana İstanbul merkezli next-gen dijital reklam ajansı.",
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
