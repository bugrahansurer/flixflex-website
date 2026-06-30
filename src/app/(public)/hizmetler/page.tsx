import type { Metadata } from "next"
import { CTASection } from "@/components/public"
import { ServicesShowcase } from "@/components/public/services/services-showcase"

import { getPageBySlug } from "@/lib/page-data"
import { PageRenderer } from "@/components/public/page-renderer"
import { listPublishedMainServices, listPublishedPortfolio } from "@/lib/content-store"
import { StarField } from "@/components/ui/star-field"
import { Eyebrow } from "@/components/ui/eyebrow"

// ── SEO ────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Hizmetler — FlixFlex Digital Agency",
  description:
    "FlixFlex'in 6 temel hizmeti: Performance Marketing, Creative Direction, Social Media Management, Brand Identity, Content Production ve Web & Digital. Markanızı domine etmek için doğru araçlar.",
  openGraph: {
    title: "Hizmetler — FlixFlex",
    description:
      "Veri odaklı büyüme, yaratıcı strateji ve marka kimliği. FlixFlex ile markanızı bir üst seviyeye taşıyın.",
    url: "https://flixflex.com/hizmetler",
    type: "website",
  },
}

export const revalidate = 60

// ── Page ───────────────────────────────────────────────────
export default async function HizmetlerPage() {
  const [pageData, services, portfolio] = await Promise.all([
    getPageBySlug("hizmetler"),
    listPublishedMainServices(),
    listPublishedPortfolio(),
  ])

  if (!pageData || pageData.sections.length === 0) {
    return (
      <>
        {/* ── Hero ── */}
        <section className="relative bg-[var(--background)] overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
          {/* Deep-space starfield background (replaces the old grid) */}
          <StarField className="z-0" />

          {/* Purple top-left accent */}
          <span
            aria-hidden
            className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 0% 0%, rgba(255, 79, 216,0.1) 0%, transparent 60%)",
            }}
          />

          <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
            {/* Eyebrow */}
            <Eyebrow className="mb-6">Hizmetlerimiz</Eyebrow>

            {/* Main heading */}
            <h1
              className="font-display font-extrabold leading-[1.05] tracking-[-0.03em] text-[var(--foreground)] mb-6 max-w-4xl"
              style={{ fontSize: "clamp(32px, 4vw, 68px)" }}
            >
              Markanı{" "}
              <span className="text-[var(--ff-purple)]">domine</span>{" "}
              etmek için 6 yol
            </h1>

            {/* Description */}
            <p className="text-base md:text-xl text-[var(--foreground-muted)] max-w-2xl leading-relaxed">
              Strateji, yaratıcılık ve teknoloji — üçünü aynı anda doğru kullanan markalar öne çıkar. İşte biz de tam olarak bunu yapıyoruz.
            </p>

            {/* Stat strip */}
            <div className="mt-12 flex flex-wrap gap-8 md:gap-14">
              {[
                { value: String(services.length), label: "Temel Hizmet" },
                { value: `${portfolio.length}+`, label: "Tamamlanan Proje" },
                { value: "5 Yıl", label: "Sektör Deneyimi" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <span className="font-display text-3xl md:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.15em] text-[var(--foreground-faint)]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services showcase (bento) ── */}
        <ServicesShowcase services={services} />

        {/* ── Bottom CTA ── */}
        <CTASection
          eyebrow="Hazır mısın?"
          title={
            <>
              Hangi hizmetten{" "}
              <span className="text-[var(--ff-purple)]">başlayalım?</span>
            </>
          }
          description="Brief'ini paylaş, 24 saat içinde sana özel bir strateji taslağı hazırlayalım."
          primaryCTA={{ label: "İletişime Geç", href: "/iletisim" }}
          secondaryCTA={{ label: "Portfolyoyu Gör", href: "/portfolio" }}
          variant="dark"
        />
      </>
    )
  }

  return <PageRenderer sections={pageData.sections} portfolioItems={portfolio} servicesItems={services} />
}
