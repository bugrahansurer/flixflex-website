// ═══════════════════════════════════════════════════════════
// FlixFlex — İletişim (Contact) Page
// Server Component — layout already provides Navbar + Footer
// ═══════════════════════════════════════════════════════════

import { type Metadata } from "next"
import { Eyebrow } from "@/components/ui/eyebrow"
import { ContactForm } from "@/components/public/contact/contact-form"
import { ContactInfo } from "@/components/public/contact/contact-info"
import { HeroStrip } from "./_components/hero-strip"
import { WhyUs } from "./_components/why-us"
import { FaqAccordion } from "./_components/faq-accordion"

import { getPageBySlug } from "@/lib/page-data"
import { listPublishedPortfolio } from "@/lib/content-store"
import { PageRenderer } from "@/components/public/page-renderer"
import { StarField } from "@/components/ui/star-field"

export const metadata: Metadata = {
  title: "İletişim · FlixFlex Reklam Ajansı",
  description:
    "Projenizi bizimle paylaşın. 24 saat içinde yanıt garantisi — İstanbul merkezli next-gen dijital ajans.",
  openGraph: {
    title: "İletişim · FlixFlex",
    description: "Brief gönderin, birlikte büyüyelim.",
    url: "https://flixflex.com/iletisim",
  },
}

export default async function IletisimPage() {
  const portfolioItems = await listPublishedPortfolio();
  const pageData = await getPageBySlug("iletisim")

  if (!pageData || pageData.sections.length === 0) {
    return (
      <>
        {/* ── 1. Hero strip ──────────────────────────────────── */}
        <HeroStrip />

        {/* ── 2. Two-column: form + info ─────────────────────── */}
        <section className="relative bg-[var(--background)] py-20 md:py-28">
          {/* Deep-space starfield background (replaces the old grid) */}
          <StarField className="z-0" />

          <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* Form panel */}
              <div
                className="ff-shape-container ff-card lg:col-span-7"
              >
                {/* Panel header */}
                <div className="mb-8">
                  <Eyebrow className="mb-3">Brief Formu</Eyebrow>
                  <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[var(--foreground)] leading-tight">
                    Projenizi anlatın
                  </h2>
                  <p className="mt-2 text-sm text-[var(--foreground-muted)] leading-relaxed">
                    Ne kadar detay verirseniz o kadar iyi bir ilk toplantı olur.
                    Tüm alanları doldurmak zorunlu değilsiniz.
                  </p>
                </div>

                <ContactForm />
              </div>

              {/* Info panel */}
              <div className="lg:col-span-5">
                <ContactInfo />
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Why us mini-section ─────────────────────────── */}
        <WhyUs />

        {/* ── 4. FAQ accordion ───────────────────────────────── */}
        <FaqAccordion />
      </>
    )
  }

  return <PageRenderer sections={pageData.sections} portfolioItems={portfolioItems} />
}
