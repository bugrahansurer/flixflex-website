import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "@/lib/icons"
import { PortfolioSection, SERVICES } from "@/components/public"
import { listPublishedServices, getPublishedServiceBySlug } from "@/lib/content-store"
import { ProcessSteps } from "@/components/public/services/process-steps"
import { DeliverablesGrid } from "@/components/public/services/deliverables-grid"
import { CaseStudyTeaser } from "@/components/public/services/case-study-teaser"
import { ServiceCta } from "@/components/public/services/service-cta"
import { ServiceHeroVisual } from "@/components/public/services/service-hero-visual"
import { ParentServicePage } from "./parent-service-page"
import { StarField } from "@/components/ui/star-field"
import { Eyebrow } from "@/components/ui/eyebrow"

// ── Static params ──────────────────────────────────────────
export const revalidate = 60

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }))
}

// ── Dynamic metadata ───────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = await getPublishedServiceBySlug(slug)

  if (!service) {
    return { title: "Hizmet Bulunamadı — FlixFlex" }
  }

  return {
    title: `${service.title} — FlixFlex Hizmetleri`,
    description: service.description,
    openGraph: {
      title: `${service.title} — FlixFlex`,
      description: service.description,
      url: `https://flixflex.com/hizmetler/${slug}`,
      type: "website",
    },
  }
}

// ── Page ───────────────────────────────────────────────────
export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const services = await listPublishedServices()
  const service = services.find((s) => s.slug === slug)

  if (!service) {
    notFound()
  }

  const resolvedService = service!
  const serviceIndex = services.findIndex((s) => s.slug === slug)

  const serviceWithChildren = await getPublishedServiceBySlug(slug)
  const children = serviceWithChildren?.children

  if (children && children.length > 0) {
    return (
      <ParentServicePage
        service={{ ...resolvedService, children }}
        services={services}
        serviceIndex={serviceIndex}
      />
    )
  }

  return (
    <>
      {/* ══════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════ */}
      <section className="relative bg-[var(--background)] overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        {/* Deep-space starfield background (replaces the old grid) */}
        <StarField className="z-0" />

        {/* Purple aura top-left */}
        <span
          aria-hidden
          className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 0% 0%, rgba(255, 79, 216,0.12) 0%, transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
          {/* ── Breadcrumb ── */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-[12px] text-[var(--foreground-faint)]">
              <li>
                <Link
                  href="/hizmetler"
                  className="hover:text-[var(--ff-purple)] transition-colors duration-150"
                >
                  Hizmetler
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight size={12} strokeWidth={2} />
              </li>
              <li className="text-[var(--foreground-muted)]">
                {resolvedService.title}
              </li>
            </ol>
          </nav>

          {/* ── Hero content: text + visual ── */}
          <div className="grid md:grid-cols-[1fr_auto] gap-10 md:gap-16 items-center">
            {/* Text */}
            <div className="flex flex-col gap-6 max-w-2xl">
              {/* Service badge */}
              <span className="ff-shape-container bg-[var(--ff-purple)]/10 border border-[var(--ff-purple)]/30 px-3 py-2 text-[10px] w-fit">
                {String(serviceIndex + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
              </span>

              {/* Title */}
              <h1
                className="font-display font-extrabold leading-[1.0] text-[var(--foreground)]"
                style={{ fontSize: "clamp(2rem, 3vw, 4rem)" }}
              >
                {resolvedService.title}
              </h1>

              {/* Accent description */}
              <p className="text-base md:text-lg text-[var(--ff-purple)] font-medium leading-relaxed border-l-2 border-[var(--ff-purple)] pl-4">
                {resolvedService.description}
              </p>

              {/* Body */}
              <p className="text-base md:text-sm text-[var(--foreground-muted)] leading-relaxed">
                {resolvedService.body}
              </p>

              {/* Inline CTA links */}
              <div className="flex flex-wrap gap-4 mt-2">
                <Link
                  href="/iletisim"
                  className="ff-btn ff-btn-primary inline-flex items-center h-9 font-semibold text-xs gap-2"
                >
                  Hemen Başlayalım
                </Link>
                <Link
                  href="/hizmetler"
                  className="ff-btn ff-btn-ghost inline-flex items-center gap-2"
                >
                  ← Tüm Hizmetler
                </Link>
              </div>
            </div>

            {/* Visual */}
            <ServiceHeroVisual slug={slug} index={serviceIndex} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          2. SÜREÇ ADIMLARI (Process Steps)
      ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[var(--background)] border-t border-[var(--border)]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
          <div className="grid lg:grid-cols-[280px_1fr] xl:grid-cols-[340px_1fr] gap-12 lg:gap-20">
            {/* Sticky header column */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Eyebrow className="mb-4">Süreç</Eyebrow>
              <h2 className="font-display text-2xl md:text-4xl font-extrabold leading-[1.1] tracking-tight text-[var(--foreground)] mb-4">
                Süreç adımları
              </h2>
              <p className="text-sm md:text-base text-[var(--foreground-muted)] leading-relaxed">
                Projelerimizi nasıl yürüttüğümüz şeffaf ve öngörülebilir. Her adım belgelenmiş, her aşama ölçülebilir.
              </p>
            </div>

            {/* Steps */}
            <ProcessSteps steps={resolvedService.processSteps} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          3. WHAT YOU GET (Deliverables)
      ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
          {/* Header */}
          <div className="mb-12 md:mb-16">
            <Eyebrow className="mb-4">Teslim Edilenler</Eyebrow>
            <h2 className="font-display text-2xl md:text-4xl font-extrabold leading-[1.1] tracking-tight text-[var(--foreground)] mb-4">
              Ne elde edersiniz?
            </h2>
            <p className="text-sm md:text-base text-[var(--foreground-muted)] max-w-xl leading-relaxed">
              Bu hizmet kapsamında teslim edilecek tüm çıktılar. Net beklentiler, net teslimatlar.
            </p>
          </div>

          {/* Grid */}
          <DeliverablesGrid items={resolvedService.deliverables} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          4. CASE STUDY TEASER
      ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[var(--background)] border-t border-[var(--border)]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
          <div className="mb-10 md:mb-14">
            <Eyebrow className="mb-4">Referans</Eyebrow>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-[var(--foreground)]">
              Gerçek projeler, gerçek sonuçlar
            </h2>
          </div>

          <CaseStudyTeaser serviceTitle={resolvedService.title} />
        </div>
      </section>

      {resolvedService.relatedPortfolio?.length ? (
        <section className="border-t border-[var(--border)] bg-[var(--background)]">
          <PortfolioSection items={resolvedService.relatedPortfolio} />
        </section>
      ) : null}

      {/* ══════════════════════════════════════════════════
          5. FINAL CTA
      ══════════════════════════════════════════════════ */}
      <ServiceCta serviceTitle={resolvedService.title} />
    </>
  )
}
