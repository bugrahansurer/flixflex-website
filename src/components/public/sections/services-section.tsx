import { ArrowRight } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { ServiceCard } from "./service-card"
import { StarField } from "@/components/ui/star-field"
import { Eyebrow } from "@/components/ui/eyebrow"
import { RevealGroup, RevealItem } from "@/components/ui/reveal"
import type { Service } from "./services-data"

// ── Props ──────────────────────────────────────────
interface ServicesSectionProps {
  services: Service[]
  headline?: string
  subheadline?: string
}

// ── Section ────────────────────────────────────────
export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section
      className={cn(
        "relative bg-[var(--background)] text-[var(--foreground)]",
        "overflow-hidden"
      )}
    >
      {/* Deep-space starfield background (replaces the old grid) */}
      <StarField className="z-0" />

      {/* Purple corner accent — top-right */}
      <span
        aria-hidden
        className="absolute top-0 right-0 w-[380px] h-[380px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 100% 0%, rgba(255, 79, 216,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 px-6 md:px-10 xl:px-16">
        {/* ── Section header ── */}
        <div className="w-full flex flex-col items-center justify-center py-6 md:py-10">
          <div className="w-full flex flex-col items-center justify-center space-y-8 md:space-y-12">
            <RevealGroup className="flex flex-col items-center justify-center gap-3 text-center">
              <RevealItem>
                <Eyebrow align="center">Hizmetlerimiz</Eyebrow>
              </RevealItem>
              <RevealItem>
                <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tighter max-w-3xl text-[var(--foreground)]">
                  Sunduğumuz <span className="text-[var(--ff-purple)]">Hizmetler</span>
                </h2>
              </RevealItem>
              <RevealItem>
                <p className="text-[var(--foreground-muted)] text-base md:text-lg max-w-xl leading-relaxed">
                  Sunduğumuz hizmetlerle size nasıl değer katabileceğinizi keşfedin.
                </p>
              </RevealItem>
              <RevealItem>
                <button className="inline-flex items-center gap-1.5 px-3 py-1 underline text-[11px] font-semibold text-[var(--foreground)] hover:text-[var(--ff-purple)] transition-colors mt-1">
                  Tüm Hizmetlerimiz
                  <ArrowRight size={11} />
                </button>
              </RevealItem>
            </RevealGroup>
            {/* ── Desktop grid (hidden on mobile) ── */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <div key={service.slug} className="bg-[var(--background)]">
                  <ServiceCard service={service} index={i} />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* ── Mobile vertical stack ── */}
        <div className={cn("md:hidden", "flex flex-col gap-4 pb-4")}>
          {services.map((service, i) => (
            <div key={service.slug} className="w-full">
              <ServiceCard service={service} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
