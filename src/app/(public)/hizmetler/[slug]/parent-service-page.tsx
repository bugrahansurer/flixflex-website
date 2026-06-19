"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, ArrowRight, Layers } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/ui/eyebrow"
import { staggerContainer, scaleInUp } from "@/lib/animations"
import { ServiceHeroVisual } from "@/components/public/services/service-hero-visual"
import { ProcessSteps } from "@/components/public/services/process-steps"
import { DeliverablesGrid } from "@/components/public/services/deliverables-grid"
import { CaseStudyTeaser } from "@/components/public/services/case-study-teaser"
import { ServiceCta } from "@/components/public/services/service-cta"
import { PortfolioSection } from "@/components/public"
import type { Service } from "@/components/public/sections/services-data"
import * as LucideIcons from "@/lib/icons"
import type { LucideIcon } from "@/lib/icons"
import { StarField } from "@/components/ui/star-field"

interface ParentServicePageProps {
  service: Service & { children?: Service[] }
  services: Service[]
  serviceIndex: number
}

export function ParentServicePage({ service, serviceIndex }: ParentServicePageProps) {
  const children = service.children ?? []

  return (
    <>
      {/* ══════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════ */}
      <section className="relative bg-[var(--background)] overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        {/* Deep-space starfield background (replaces the old grid) */}
        <StarField className="z-0" />
        <span
          aria-hidden
          className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 0% 0%, rgba(255, 79, 216,0.12) 0%, transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-[12px] uppercase tracking-[0.12em] text-[var(--foreground-faint)]">
              <li>
                <Link href="/hizmetler" className="hover:text-[var(--ff-purple)] transition-colors duration-150">
                  Hizmetler
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight size={12} strokeWidth={2} />
              </li>
              <li className="text-[var(--foreground-muted)]">{service.title}</li>
            </ol>
          </nav>

          <div className="grid md:grid-cols-[1fr_auto] gap-10 md:gap-16 items-center">
            <div className="flex flex-col gap-6 max-w-2xl">
              <span className="ff-shape-container bg-[var(--ff-purple)]/10 border border-[var(--ff-purple)]/30 px-3 py-2 text-[10px] w-fit inline-flex items-center gap-1.5">
                <Layers size={10} />
                {children.length} alt hizmet
              </span>

              <h1
                className="font-display font-extrabold leading-[1.0] text-[var(--foreground)]"
                style={{ fontSize: "clamp(2rem, 3vw, 4rem)" }}
              >
                {service.title}
              </h1>

              <p className="text-base md:text-lg text-[var(--ff-purple)] font-medium leading-relaxed border-l-2 border-[var(--ff-purple)] pl-4">
                {service.description}
              </p>

              <p className="text-base md:text-sm text-[var(--foreground-muted)] leading-relaxed">
                {service.body}
              </p>

              <div className="flex flex-wrap gap-4 mt-2">
                <Link href="/iletisim" className="ff-btn ff-btn-primary inline-flex items-center h-9 font-semibold text-xs gap-2">
                  Hemen Başlayalım
                </Link>
                <Link href="/hizmetler" className="ff-btn ff-btn-ghost inline-flex items-center gap-2">
                  ← Tüm Hizmetler
                </Link>
              </div>
            </div>

            <ServiceHeroVisual slug={service.slug} index={serviceIndex} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          2. ALT HİZMETLER GRID
      ══════════════════════════════════════════════════ */}
      {children.length > 0 && (
        <section className="py-20 md:py-28 bg-[var(--surface)] border-t border-[var(--border)]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
            <div className="mb-12 md:mb-16">
              <Eyebrow className="mb-4">Alt Hizmetler</Eyebrow>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-[var(--foreground)]">
                {service.title} kapsamında sunduklarımız
              </h2>
              <p className="text-sm md:text-base text-[var(--foreground-muted)] mt-4 max-w-xl leading-relaxed">
                Her bir hizmet kalemi bağımsız olarak alınabilir veya entegre bir paket olarak birleştirilebilir.
              </p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            >
              {children.map((child) => (
                <ChildServiceCard key={child.slug} child={child} />
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          3. SÜREÇ ADIMLARI
      ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[var(--background)] border-t border-[var(--border)]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
          <div className="grid lg:grid-cols-[280px_1fr] xl:grid-cols-[340px_1fr] gap-12 lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Eyebrow className="mb-4">Süreç</Eyebrow>
              <h2 className="font-display text-2xl md:text-4xl font-extrabold leading-[1.1] tracking-tight text-[var(--foreground)] mb-4">
                Süreç adımları
              </h2>
              <p className="text-sm md:text-base text-[var(--foreground-muted)] leading-relaxed">
                Projelerimizi nasıl yürüttüğümüz şeffaf ve öngörülebilir. Her adım belgelenmiş, her aşama ölçülebilir.
              </p>
            </div>
            <ProcessSteps steps={service.processSteps} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          4. WHAT YOU GET (Deliverables)
      ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
          <div className="mb-12 md:mb-16">
            <Eyebrow className="mb-4">Teslim Edilenler</Eyebrow>
            <h2 className="font-display text-2xl md:text-4xl font-extrabold leading-[1.1] tracking-tight text-[var(--foreground)] mb-4">
              Ne elde edersiniz?
            </h2>
            <p className="text-sm md:text-base text-[var(--foreground-muted)] max-w-xl leading-relaxed">
              Bu hizmet kapsamında teslim edilecek tüm çıktılar. Net beklentiler, net teslimatlar.
            </p>
          </div>
          <DeliverablesGrid items={service.deliverables} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          5. CASE STUDY TEASER
      ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[var(--background)] border-t border-[var(--border)]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
          <div className="mb-10 md:mb-14">
            <Eyebrow className="mb-4">Referans</Eyebrow>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-[var(--foreground)]">
              Gerçek projeler, gerçek sonuçlar
            </h2>
          </div>
          <CaseStudyTeaser serviceTitle={service.title} />
        </div>
      </section>

      {service.relatedPortfolio?.length ? (
        <section className="border-t border-[var(--border)] bg-[var(--background)]">
          <PortfolioSection items={service.relatedPortfolio} />
        </section>
      ) : null}

      {/* ══════════════════════════════════════════════════
          6. FINAL CTA
      ══════════════════════════════════════════════════ */}
      <ServiceCta serviceTitle={service.title} />
    </>
  )
}

function ChildServiceCard({ child }: { child: Service }) {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>
  const Icon = child.iconKey ? (icons[child.iconKey] ?? LucideIcons.Globe) : LucideIcons.Globe

  return (
    <motion.div
      variants={scaleInUp}
      className={cn(
        "ff-shape-container group relative bg-[var(--surface-elevated)] border border-[var(--border)]",
        "p-6 transition-all duration-300 hover:border-[var(--ff-purple-border)]",
        "hover:shadow-[0_0_40px_rgba(255, 79, 216,0.12)]",
        "flex flex-col"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-[var(--ff-purple)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-[var(--ff-purple)]/10 border border-[var(--ff-purple)]/20 flex items-center justify-center shrink-0 group-hover:bg-[var(--ff-purple)]/20 transition-colors">
          <Icon size={18} className="text-[var(--ff-purple)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-extrabold text-[var(--foreground)] leading-tight group-hover:text-[var(--ff-purple)] transition-colors">
            {child.title}
          </h3>
          {child.relatedPortfolio && child.relatedPortfolio.length > 0 && (
            <p className="text-[11px] text-[var(--foreground-faint)] mt-0.5">
              {child.relatedPortfolio.length} proje
            </p>
          )}
        </div>
      </div>

      <p className="text-[13px] text-[var(--foreground-muted)] leading-relaxed flex-1 line-clamp-3">
        {child.description}
      </p>

      <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {child.features.slice(0, 3).map((f, i) => (
            <span key={i} className="ff-shape-container px-2 py-0.5 text-[10px] border border-[var(--border)] text-[var(--foreground-faint)] bg-[var(--surface)]">
              {f}
            </span>
          ))}
        </div>
        <Link
          href={`/hizmetler/${child.slug}`}
          className="w-8 h-8 rounded-full bg-[var(--ff-purple)]/10 border border-[var(--ff-purple)]/20 flex items-center justify-center text-[var(--ff-purple)] group-hover:bg-[var(--ff-purple)] group-hover:text-white transition-all duration-300 shrink-0"
        >
          <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  )
}
