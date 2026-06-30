import type { Metadata } from "next"
import {
  HeroSection,
  StatsSection,
  ServicesSection,
  SERVICES,
  PORTFOLIO,
  BrandStorySection,
  PortfolioSection,
  TestimonialsSection,
  CTASection,
  ScrollAnimation,
  ContainerTextScroll,
} from "@/components/public"

import { getPageBySlug } from "@/lib/page-data"
import { listPublishedPortfolio, listPublishedMainServices } from "@/lib/content-store"
import { PageRenderer } from "@/components/public/page-renderer"

export const metadata: Metadata = {
  title: "FlixFlex — Markaları Domine Eder",
  description:
    "Hız. Güç. Esneklik. FlixFlex; markaları bir sonraki seviyeye taşıyan next-gen reklam ajansıdır.",
}

export default async function HomePage() {
  let portfolioItems;
  try {
    portfolioItems = await listPublishedPortfolio();
  } catch (err) {
    console.error('[HomePage] Portfolio load error:', err);
    portfolioItems = PORTFOLIO;
  }

  let servicesItems;
  try {
    servicesItems = await listPublishedMainServices();
  } catch (err) {
    console.error('[HomePage] Services load error:', err);
    servicesItems = SERVICES.map(({ icon, ...rest }) => rest);
  }

  const pageData = await getPageBySlug("anasayfa")

  if (!pageData || pageData.sections.length === 0) {
    return (
      <>
        <HeroSection />
        <ScrollAnimation direction="up" blur delay={0}>
          <StatsSection />
        </ScrollAnimation>
        <ScrollAnimation direction="up" blur delay={0.15}>
          <ServicesSection services={servicesItems} />
        </ScrollAnimation>
        <ScrollAnimation direction="up" blur delay={0.2}>
          <BrandStorySection />
        </ScrollAnimation>
        <ScrollAnimation direction="up" blur delay={0.25}>
          <PortfolioSection />
        </ScrollAnimation>
        <ContainerTextScroll
          titleComponent={
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--ff-purple)]/10 border border-[var(--ff-purple)]/20 text-[11px] font-semibold text-[var(--ff-purple)] ff-shape-container">
                FlixFlex Manifesto
              </span>
              <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-extrabold text-[var(--foreground)] tracking-tight mt-4">
                Sıradaki Seviyeye<br />
                <span className="text-[var(--ff-purple)]">Hazır Mısın?</span>
              </h2>
            </div>
          }
        >
          <div className="flex flex-col gap-4 p-6 text-[var(--foreground)]">
            <p className="text-sm md:text-base leading-relaxed text-[var(--foreground-muted)] max-w-2xl">
              Hız. Güç. Esneklik. FlixFlex; markaları bir sonraki seviyeye taşıyan next-gen reklam ajansıdır.
              Veri odaklı stratejiler, yaratıcı yönlendirme ve teknik mükemmellik — hepsi tek çatı altında.
            </p>
          </div>
        </ContainerTextScroll>
        <ScrollAnimation direction="up" blur delay={0.3}>
          <TestimonialsSection />
        </ScrollAnimation>
        <ScrollAnimation direction="up" blur delay={0.35}>
          <CTASection />
        </ScrollAnimation>
      </>
    )
  }

  return <PageRenderer sections={pageData.sections} portfolioItems={portfolioItems} servicesItems={servicesItems} />
}
