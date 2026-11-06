import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { JsonLd, SITE_URL, breadcrumbLd } from "@/components/seo/json-ld"
import { CtaLink } from "@/components/public/cta-link"
import { StarField } from "@/components/ui/star-field"
import { Eyebrow } from "@/components/ui/eyebrow"
import { ServiceGuideSection } from "@/components/public/services/service-guide"
import { ServiceCta } from "@/components/public/services/service-cta"
import { PortfolioSection } from "@/components/public/sections/portfolio-section"
import { listPublishedPortfolio } from "@/lib/content-store"
import { DEFAULT_OG_IMAGES } from "@/lib/seo"
import { LOCAL_PAGES } from "./local-pages"

export function localPageMetadata(slug: string): Metadata {
  const page = LOCAL_PAGES[slug]
  if (!page) return {}
  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: `${page.h1} — FlixFlex`,
      description: page.description,
      url: `/${slug}`,
      type: "website",
      images: DEFAULT_OG_IMAGES,
    },
    alternates: { canonical: `/${slug}` },
  }
}

/** Şehir + hizmet açılış sayfası (ör. /mersin-web-tasarim). */
export async function LocalLanding({ slug }: { slug: string }) {
  const page = LOCAL_PAGES[slug]
  if (!page) notFound()
  const portfolioItems = await listPublishedPortfolio()

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: page.h1,
          serviceType: page.serviceName,
          description: page.description,
          url: `${SITE_URL}/${slug}`,
          provider: { "@id": `${SITE_URL}/#organization` },
          areaServed: page.areaServed.map((name) => ({ "@type": "Place", name })),
        }}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: "Ana Sayfa", path: "/" },
          { name: page.h1, path: `/${slug}` },
        ])}
      />

      <section className="relative bg-[var(--background)] overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        <StarField className="z-0" />
        <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
          <div className="flex flex-col gap-6 max-w-3xl">
            <Eyebrow>{page.city} · FlixFlex</Eyebrow>
            <h1
              className="font-display font-extrabold leading-[1.0] text-[var(--foreground)]"
              style={{ fontSize: "clamp(2.25rem, 4vw, 4.5rem)" }}
            >
              {page.h1}
            </h1>
            <p className="text-base md:text-lg text-[var(--ff-purple)] font-medium leading-relaxed border-l-2 border-[var(--ff-purple)] pl-4">
              {page.lead}
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <CtaLink
                href="/iletisim"
                className="ff-btn ff-btn-primary inline-flex items-center h-9 font-semibold text-xs gap-2"
              >
                Ücretsiz Teklif Al
              </CtaLink>
              <Link href="/portfolio" className="ff-btn ff-btn-ghost inline-flex items-center gap-2">
                İşlerimizi Gör
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ServiceGuideSection guide={page.guide} />

      {portfolioItems.length > 0 && (
        <section className="border-t border-[var(--border)] bg-[var(--background)]">
          <PortfolioSection items={portfolioItems.slice(0, 6)} />
        </section>
      )}

      <ServiceCta serviceTitle={page.serviceName} />
    </>
  )
}
