"use client"

import * as React from "react"
import type { SectionBlock, SectionType } from "@/types/page-builder"
import {
  HeroSection,
  HeroVideoSection,
  StatsSection,
  ServicesSection,
  PortfolioSection,
  PortfolioVerticalScrollSection,
  TestimonialsSection,
  CTASection,
  ManifestoSection,
  StorySection,
  ValuesSection,
  TeamSection,
  WhyUsSection,
  ServicesListAnimated,
  ContactForm,
  ContactInfo,
  TextContentSection,
  ImageTextSection,
  VideoEmbedSection,
  BlogListClient,
  AppointmentCardSection,
  ModernManifestoSection,
} from "@/components/public"
import type { Service } from "@/components/public/sections/services-data"
import type { BlogPost } from "@/components/public/blog/blog-data"
import { PortfolioHero } from "@/app/(public)/portfolio/_components/portfolio-hero"
import { HeroStrip as ContactHero } from "@/app/(public)/iletisim/_components/hero-strip"
import { FaqAccordion } from "@/app/(public)/iletisim/_components/faq-accordion"
import { DemoRadialScrollGalleryBento } from "@/components/ui/portfolio-and-image-gallery"
import { DemoPortfolioGallery } from "@/components/ui/portfolio-gallery"
import { DemoOfferCarousel } from "@/components/ui/offer-carousel"
import { DemoProjectShowcase } from "@/components/ui/project-showcase"
import { AnimatedVideoHero, VideoHeroProvider } from "@/components/public/hero/animated-video-hero"
import { ParallaxScrolling } from "@/components/public/parallax-scrolling"
import { ServicesShowcase } from "@/components/public/services/services-showcase"
import { VideoTestimonialsSection, type VideoTestimonialItem } from "@/components/public/sections/video-testimonials-section"
import { PoemAnimation, ScrollExpandMedia, FlowArt, FlowSection } from "@/components/ui"
import dynamic from "next/dynamic"
// Lazy — pulls in three.js (~600KB); only loaded on pages that actually use it.
const WovenLightHero = dynamic(
  () => import("@/components/ui/woven-light-hero").then((m) => m.WovenLightHero),
  { ssr: false }
)
import { SectionWrapper } from "./section-wrapper"
import { useUIStore, type HeaderTone } from "@/lib/ui-store"
import { ArrowRight } from "@/lib/icons"

/** Full-bleed heroes with a fixed dark background (video/image), so the
 *  transparent header sitting over them needs white text regardless of theme.
 *  Section types not listed here fall back to 'theme' (follows the active theme). */
const HEADER_TONE_BY_TYPE: Partial<Record<SectionType, HeaderTone>> = {
  "hero-video": "dark",
  "hero-animated-video": "dark",
  "parallax": "dark",
  "poem-animation": "dark",
  "scroll-expansion-hero": "dark",
  "woven-light-hero": "dark",
}

/** Props shape consumed by section renderers — covers all properties used across section types. */
interface SectionRendererProps {
  headline?: string
  subheadline?: string
  description?: string
  ctaLabel?: string
  ctaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  primaryCtaLabel?: string
  primaryCtaHref?: string
  eyebrow?: string
  videoUrl?: string
  videoUrlMobile?: string
  posterUrl?: string
  body?: string
  alignment?: string
  maxWidthProse?: boolean
  imageUrl?: string
  imageAlt?: string
  imagePosition?: string
  variant?: string
  hideMobileDock?: boolean
  [key: string]: unknown
}

interface PageRendererProps {
  sections: SectionBlock[]
  portfolioItems?: unknown[]
  servicesItems?: Service[]
  blogPosts?: BlogPost[]
}

const SECTION_RENDERERS: Partial<Record<SectionType, (
  section: SectionBlock,
  context?: { portfolioItems?: unknown[]; servicesItems?: Service[]; blogPosts?: BlogPost[] }
) => React.ReactNode>> = {
  "hero": (s) => {
    const p = s.props as SectionRendererProps
    return (
      <HeroSection
        title={p.headline}
        subtitle={p.subheadline}
        primaryCta={p.ctaLabel ? { label: p.ctaLabel, href: p.ctaHref ?? "#" } : undefined}
        secondaryCta={p.secondaryCtaLabel ? { label: p.secondaryCtaLabel, href: p.secondaryCtaHref ?? "#" } : undefined}
      />
    )
  },
  "stats": () => <StatsSection />,
  "services": (s, ctx) => {
    const p = s.props as SectionRendererProps
    return <ServicesSection headline={p.headline} subheadline={p.subheadline} services={ctx?.servicesItems ?? []} />
  },
  "services-showcase": (s, ctx) => {
    const p = s.props as SectionRendererProps
    return (
      <ServicesShowcase
        headline={p.headline}
        subheadline={p.subheadline}
        ctaLabel={typeof p.ctaLabel === "string" ? p.ctaLabel : undefined}
        ctaHref={typeof p.ctaHref === "string" ? p.ctaHref : undefined}
        services={ctx?.servicesItems ?? []}
      />
    )
  },
  "portfolio": (s, ctx) => <PortfolioSection items={ctx?.portfolioItems as any} />,
  "portfolio-vertical-scroll": (s, ctx) => {
    const p = s.props as any
    return (
      <PortfolioVerticalScrollSection
        headline={p.headline}
        subheadline={p.subheadline}
        direction={p.direction}
        speed={p.speed}
        pauseOnHover={p.pauseOnHover}
        maxItems={p.maxItems}
        hideMobileDock={p.hideMobileDock}
        items={ctx?.portfolioItems as any}
      />
    )
  },
  "testimonials": () => <TestimonialsSection />,
  "video-testimonials": (s) => {
    const p = s.props as { eyebrow?: string; headline?: string; subheadline?: string; items?: VideoTestimonialItem[] }
    return <VideoTestimonialsSection eyebrow={p.eyebrow} headline={p.headline} subheadline={p.subheadline} items={p.items} />
  },
  "team": (s) => <TeamSection {...(s.props as any)} />,
  "manifesto": (s) => <ManifestoSection {...(s.props as any)} />,
  "story": (s) => <StorySection {...(s.props as any)} />,
  "values": (s) => <ValuesSection {...(s.props as any)} />,
  "why-us": (s) => <WhyUsSection {...(s.props as any)} />,
  "faq": () => <FaqAccordion />,
  "services-list": (s, ctx) => (
    <section className="relative bg-[var(--background)] py-0">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        <ServicesListAnimated services={ctx?.servicesItems} />
      </div>
    </section>
  ),
  "portfolio-hero": () => <PortfolioHero totalProjects={2} clientCount={1} yearCount={1} categoryCount={1} />,
  "portfolio-grid": (s, ctx) => <PortfolioSection items={ctx?.portfolioItems as any} />,
  "blog-hero": () => {
    return (
      <div className="w-full flex flex-col items-center justify-center mt-16 py-10 md:py-16">
        <div className="w-full">
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="ff-shape-container inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--ff-purple)]/10 backdrop-blur-xs border border-[var(--ff-purple)]/20 text-[11px] font-semibold text-[var(--ff-purple)]">
              Blog Yazıları
            </span>
            <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
              Haberdar Kalın
            </h2>
            <p className="text-xs text-[var(--foreground-muted)] max-w-xl">
              En güncel ve ilgi çekici blog yazılarını aşağıdan inceleyebilirsiniz.
            </p>
            <button className="inline-flex items-center gap-1.5 px-3 py-1 underline text-[11px] font-semibold text-[var(--foreground)] hover:text-[var(--ff-purple)] transition-colors mt-6">
              Tüm Blog Yazıları
              <ArrowRight size={11} />
            </button>
          </div>
          {/*<OfferCarousel offers={offers} /> */}
        </div>
      </div>
    )
  },
  "blog-grid": (s, ctx) => (
    <section className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 pb-20 md:pb-28">
      <BlogListClient posts={ctx?.blogPosts} />
    </section>
  ),
  "contact-hero": () => <ContactHero />,
  "contact-info": () => (
    <section className="relative bg-[var(--background)] py-20 md:py-28">
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="ff-shape-container ff-card lg:col-span-7">
            <ContactForm />
          </div>
          <div className="lg:col-span-5">
            <ContactInfo />
          </div>
        </div>
      </div>
    </section>
  ),
  "cta": (s) => {
    const p = s.props as any
    return (
      <CTASection
        eyebrow={p.eyebrow}
        title={p.headline}
        description={p.description}
        primaryCTA={p.primaryCtaLabel ? { label: p.primaryCtaLabel, href: p.primaryCtaHref } : undefined}
        secondaryCTA={p.secondaryCtaLabel ? { label: p.secondaryCtaLabel, href: p.secondaryCtaHref } : undefined}
        variant={p.variant as "dark" | "light" | undefined}
      />
    )
  },
  "hero-video": (s) => {
    const p = s.props as any
    return (
      <HeroVideoSection
        title={p.headline}
        subtitle={p.subheadline}
        videoUrl={p.videoUrl}
        videoUrlMobile={p.videoUrlMobile}
        posterUrl={p.posterUrl}
        primaryCta={p.ctaLabel ? { label: p.ctaLabel, href: p.ctaHref } : undefined}
        secondaryCta={p.secondaryCtaLabel ? { label: p.secondaryCtaLabel, href: p.secondaryCtaHref } : undefined}
      />
    )
  },
  "contact-form": (s) => {
    const p = s.props as any
    return (
      <section className="relative bg-[var(--background)] py-20 md:py-28">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4">
                {p.headline || "İletişime Geç"}
              </h2>
              <p className="text-[var(--foreground-muted)] text-lg">
                {p.subheadline || "Hemen konuşalım"}
              </p>
            </div>
            <div className="ff-shape-container border border-[var(--border)] bg-[var(--surface)] p-8 lg:p-12">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    )
  },
  "text-content": (s) => {
    const p = s.props as any
    return <TextContentSection {...p} />
  },
  "image-text": (s) => {
    const p = s.props as any
    return <ImageTextSection {...p} />
  },
  "video-embed": (s) => {
    const p = s.props as any
    return <VideoEmbedSection {...p} />
  },
  "portfolio-radial-gallery": (s, ctx) => <DemoRadialScrollGalleryBento items={ctx?.portfolioItems} />,
  "portfolio-marquee-gallery": (s, ctx) => <DemoPortfolioGallery items={ctx?.portfolioItems} />,
  "portfolio-offer-carousel": (s, ctx) => <DemoOfferCarousel items={ctx?.portfolioItems} />,
  "portfolio-project-showcase": (s, ctx) => <DemoProjectShowcase items={ctx?.portfolioItems} />,
  "hero-animated-video": (s) => {
    const p = s.props as any
    return (
      <VideoHeroProvider>
        <AnimatedVideoHero.Video
          videoUrl={p.videoSrc}
          videoUrlMobile={p.videoSrcMobile}
        />
        <AnimatedVideoHero.Content>
          <div className="flex flex-col items-center gap-4">
            {p.headline && (
              <h1 className="font-display text-4xl md:text-6xl lg:text-8xl font-extrabold text-white tracking-tight leading-none">
                {p.headline}
              </h1>
            )}
            {p.subheadline && (
              <p className="text-lg md:text-xl text-white/80 max-w-2xl">
                {p.subheadline}
              </p>
            )}
          </div>
        </AnimatedVideoHero.Content>
        {p.clipPathVariant && p.clipPathVariant !== "none" && (
          <AnimatedVideoHero.ClipMask insetRange={p.clipPathVariant === "circle" ? [15, 45] : [0, 35]}>
            <div className="absolute inset-0 bg-[var(--background)]" />
          </AnimatedVideoHero.ClipMask>
        )}
      </VideoHeroProvider>
    )
  },
  "parallax": (s) => {
    const p = s.props as any
    return (
      <ParallaxScrolling layers={p.layers ?? []}>
        {(p.headline || p.subheadline) && (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            {p.headline && (
              <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                {p.headline}
              </h2>
            )}
            {p.subheadline && (
              <p className="text-base md:text-lg text-white/80 max-w-xl">
                {p.subheadline}
              </p>
            )}
          </div>
        )}
      </ParallaxScrolling>
    )
  },
  "appointment-card": (s) => {
    const p = s.props as any
    return (
      <AppointmentCardSection
        eyebrow={p.eyebrow}
        headline={p.headline}
        description={p.description}
        ctaLabel={p.ctaLabel}
      />
    )
  },
  "poem-animation": (s) => {
    const p = s.props as any
    return (
      <PoemAnimation
        poemHTML={p.poemHTML}
        backgroundImageUrl={p.backgroundImageUrl}
        boyImageUrl={p.boyImageUrl}
      />
    )
  },
  "woven-light-hero": (s) => {
    const p = s.props as any
    return (
      <WovenLightHero
        headline={p.headline}
        subheadline={p.subheadline}
        ctaLabel={p.ctaLabel}
        ctaHref={p.ctaHref}
      />
    )
  },
  "scroll-expansion-hero": (s) => {
    const p = s.props as any
    return (
      <ScrollExpandMedia
        mediaType={p.mediaType}
        mediaSrc={p.mediaSrc}
        posterSrc={p.posterSrc}
        bgImageSrc={p.bgImageSrc}
        title={p.title}
        date={p.date}
        scrollToExpand={p.scrollToExpand}
        textBlend={p.textBlend}
      >
        {p.description && (
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-black dark:text-white leading-relaxed">
              {p.description}
            </p>
          </div>
        )}
      </ScrollExpandMedia>
    )
  },
  "modern-manifesto": (s) => {
    const p = s.props as any
    return (
      <ModernManifestoSection
        leftText={p.leftText}
        mediaUrl1={p.mediaUrl1}
        mediaType1={p.mediaType1}
        mediaUrl2={p.mediaUrl2}
        mediaType2={p.mediaType2}
        mediaUrl3={p.mediaUrl3}
        mediaType3={p.mediaType3}
        rightContent={p.rightContent}
        ctaLabel={p.ctaLabel}
        ctaHref={p.ctaHref}
        hideMobileDock={p.hideMobileDock}
      />
    )
  },
}

export function PageRenderer({ sections, portfolioItems, servicesItems, blogPosts }: PageRendererProps) {
  const { setMobileDockVisible } = useUIStore()
  const setHeaderTone = useUIStore((s) => s.setHeaderTone)
  const sectionRefs = React.useRef<Map<string, HTMLElement>>(new Map())

  const visibleSections = React.useMemo(() => {
    return [...sections]
      .filter((s) => s.visible)
      .sort((a, b) => a.order - b.order)
  }, [sections])

  // The transparent header only ever floats over the FIRST section (it turns
  // solid after ~12px of scroll), so the top section's background dictates the
  // header's text colour. Reset to 'theme' on unmount / when the page changes.
  const firstSectionType = visibleSections[0]?.type
  React.useEffect(() => {
    setHeaderTone((firstSectionType && HEADER_TONE_BY_TYPE[firstSectionType]) || "theme")
    return () => setHeaderTone("theme")
  }, [firstSectionType, setHeaderTone])

  React.useEffect(() => {
    // Yalnızca "Mobil Dock Gizle" seçeneği aktif section'lar dock'u gizleyebilir.
    const hideSections = visibleSections.filter(
      (s) => (s.props as { hideMobileDock?: boolean } | undefined)?.hideMobileDock === true,
    )

    // Hiçbir section dock'u gizlemiyorsa dock DAİMA görünür (stabil, titremesiz).
    if (hideSections.length === 0) {
      setMobileDockVisible(true)
      return
    }

    const hideIds = new Set(hideSections.map((s) => s.id))
    // Bir gizle-section, viewport'un alt şeridinde (dock'un oturduğu bölge) mi?
    const inDockZone = new Map<string, boolean>()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.sectionId
          if (id) inDockZone.set(id, entry.isIntersecting)
        })
        // Gizle-section'lardan biri dock bölgesindeyse dock gizlenir; değilse görünür.
        let hide = false
        inDockZone.forEach((present) => {
          if (present) hide = true
        })
        setMobileDockVisible(!hide)
      },
      // Sadece viewport'un alt %15'lik şeridini izle (dock burada durur). Tek eşikli
      // giriş/çıkış → "en görünür section" flip'i yok, titreme biter.
      { threshold: 0, rootMargin: "-85% 0px 0px 0px" },
    )

    sectionRefs.current.forEach((el, id) => {
      if (hideIds.has(id)) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [visibleSections, setMobileDockVisible])

  if (visibleSections.length === 0) return null

  // Group contiguous sections that are part of the story scroll sequence.
  const groups = visibleSections.reduce((acc, section, idx) => {
    const isStoryScrollSelf = section.transition === "story-scroll"
    const prevSection = idx > 0 ? visibleSections[idx - 1] : null
    const isStoryScrollPrev = prevSection?.transition === "story-scroll"

    const inStoryScroll = isStoryScrollSelf || isStoryScrollPrev

    let lastGroup = acc[acc.length - 1]
    const targetType = inStoryScroll ? "story-scroll" : "normal"

    if (!lastGroup || lastGroup.type !== targetType) {
      lastGroup = { type: targetType, sections: [] }
      acc.push(lastGroup)
    }

    lastGroup.sections.push(section)
    return acc
  }, [] as Array<{ type: "normal" | "story-scroll"; sections: SectionBlock[] }>)

  // Helper to determine if a section type is a full-bleed hero
  const isFullBleed = (type: string) => {
    return [
      "hero",
      "hero-video",
      "hero-animated-video",
      "woven-light-hero",
      "scroll-expansion-hero",
      "poem-animation",
      "parallax",
      "modern-manifesto"
    ].includes(type)
  }

  return (
    <>
      {groups.map((group, groupIdx) => {
        if (group.type === "story-scroll") {
          return (
            <FlowArt key={`story-group-${groupIdx}`}>
              {group.sections.map((section) => {
                const renderer = SECTION_RENDERERS[section.type]
                if (!renderer) return null

                return (
                  <FlowSection
                    key={section.id}
                    id={section.id}
                    data-section-id={section.id}
                    ref={(el) => {
                      if (el) sectionRefs.current.set(section.id, el)
                      else sectionRefs.current.delete(section.id)
                    }}
                    fullBleed={isFullBleed(section.type)}
                  >
                    {renderer(section, { portfolioItems, servicesItems, blogPosts })}
                  </FlowSection>
                )
              })}
            </FlowArt>
          )
        }

        // Normal render using SectionWrapper
        return (
          <React.Fragment key={`normal-group-${groupIdx}`}>
            {group.sections.map((section) => {
              const renderer = SECTION_RENDERERS[section.type]
              if (!renderer) {
                return (
                  <div key={section.id} className="py-20 text-center border-y border-dashed border-[var(--border)]">
                    <p className="text-xs text-[var(--foreground-faint)] uppercase tracking-widest">
                      Section Type Not Implemented: {section.type}
                    </p>
                  </div>
                )
              }

              const globalIdx = visibleSections.indexOf(section)
              return (
                <SectionWrapper
                  key={section.id}
                  section={section}
                  index={globalIdx}
                  data-section-id={section.id}
                  ref={(el) => {
                    if (el) sectionRefs.current.set(section.id, el)
                    else sectionRefs.current.delete(section.id)
                  }}
                  className="w-full"
                >
                  {renderer(section, { portfolioItems, servicesItems, blogPosts })}
                </SectionWrapper>
              )
            })}
          </React.Fragment>
        )
      })}
    </>
  )
}



