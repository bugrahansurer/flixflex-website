"use client"

import {
  FFButton, FFContainer, FFBadge,
  FFInput, FFTextarea, FFDivider, FFStatCounter,
  ThemeToggle, BackgroundPaths, AnimatedHeading,
  RotatingText, TestimonialCarousel, FFMarquee, MarqueeTag
} from "@/components/ui"
import { Container, Grid, SectionHeader } from "@/components/shared/container"
import { Zap, ArrowRight, Sparkles, Target } from "@/lib/icons"

const DEMO_TESTIMONIALS = [
  { id: 1, name: "Ayşe Yılmaz", role: "CMO", company: "TechCorp", content: "FlixFlex ile kampanya performansımız üç katına çıktı. Veri odaklı yaklaşımları ve yaratıcı vizyonları benzersiz.", rating: 5 },
  { id: 2, name: "Mehmet Can", role: "CEO", company: "StartupX", content: "Marka kimliğimizi sıfırdan oluşturdular. Sonuç hem estetik hem de işlevsel açıdan mükemmel.", rating: 5 },
  { id: 3, name: "Zeynep Ak", role: "Brand Manager", company: "RetailCo", content: "The Flix & The Flex metodolojisi gerçekten işe yarıyor. Somut sonuçlar gördük.", rating: 5 },
]

const DEMO_STATS = [
  { value: 150, suffix: "+", label: "Tamamlanan Proje", description: "Startup'tan enterprise'a" },
  { value: 89, suffix: "+", label: "Mutlu Müşteri", description: "B2B & B2C markalar" },
  { value: 340, suffix: "%", label: "Ortalama Büyüme", description: "İlk 6 ayda" },
  { value: 5, suffix: " Yıl", label: "Sektör Deneyimi", description: "2020'den bu yana" },
]

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[var(--ff-purple)] flex items-center justify-center">
              <span className="text-white font-bold text-xs">FF</span>
            </div>
            <span className="font-display font-bold text-sm tracking-tight">Design System</span>
            <FFBadge variant="purple" dot>v1.0</FFBadge>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <Container className="py-16 space-y-24">

        {/* ── TYPOGRAPHY ─────────────────────────── */}
        <section>
          <SectionHeader badge="01" title="Tipografi" align="left" />
          <div className="space-y-6">
            {[
              { size: "text-6xl md:text-7xl", label: "Display 2XL — 72px", weight: "font-bold" },
              { size: "text-5xl md:text-6xl", label: "Display XL — 60px", weight: "font-bold" },
              { size: "text-4xl md:text-5xl", label: "Display LG — 48px", weight: "font-bold" },
              { size: "text-3xl md:text-4xl", label: "Display MD — 36px", weight: "font-semibold" },
              { size: "text-xl md:text-2xl", label: "Heading — 24px", weight: "font-semibold" },
              { size: "text-base", label: "Body — 16px", weight: "font-normal" },
              { size: "text-sm", label: "Small — 14px", weight: "font-normal" },
            ].map((t) => (
              <div key={t.label} className="flex items-baseline gap-6 border-b border-[var(--border)] pb-4">
                <p className={`font-display ${t.size} ${t.weight} leading-tight text-[var(--foreground)] min-w-0`}>
                  FLIX<span className="text-[var(--ff-purple)]">FLEX</span>
                </p>
                <span className="text-xs text-[var(--foreground-faint)] shrink-0 font-mono">{t.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <p className="text-xs text-[var(--foreground-faint)] font-mono mb-4 uppercase tracking-widest">Animated Heading</p>
            <AnimatedHeading
              text="Hız Güç Esneklik"
              tag="h2"
              accentWords={["Güç"]}
              className="font-display text-4xl md:text-5xl font-bold"
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <p className="text-xs text-[var(--foreground-faint)] font-mono uppercase tracking-widest w-full">Rotating Text</p>
            <p className="font-display text-3xl font-bold text-[var(--foreground)]">
              We are{" "}
              <RotatingText
                words={["Precise", "Powerful", "Playful", "Premium"]}
                className="inline-block"
              />
            </p>
          </div>
        </section>

        <FFDivider variant="gradient" />

        {/* ── COLORS ─────────────────────────────── */}
        <section>
          <SectionHeader badge="02" title="Renk Paleti" align="left" />
          <div className="space-y-6">
            {[
              { label: "Primary — [var(--ff-purple)]", swatches: ["var(--ff-purple)", "var(--ff-purple-dark)", "var(--ff-purple-darker)", "var(--ff-purple)/30", "var(--ff-purple)/12"] },
              { label: "Secondary — #323232", swatches: ["#323232", "#484848", "#1A1A1A", "#111111", "#0C0C0C"] },
              { label: "Neutral", swatches: ["#FFFFFF", "#F2F2F2", "#E0E0E0", "#888888", "#333333"] },
            ].map((group) => (
              <div key={group.label}>
                <p className="text-xs font-mono text-[var(--foreground-faint)] mb-3 uppercase tracking-widest">{group.label}</p>
                <div className="flex gap-2">
                  {group.swatches.map((color) => (
                    <div key={color} className="flex-1 space-y-1.5">
                      <div className="h-14 border border-[var(--border)]" style={{ backgroundColor: color }} />
                      <p className="text-[10px] text-[var(--foreground-faint)] font-mono truncate">{color}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <FFDivider variant="gradient" />

        {/* ── BUTTONS ────────────────────────────── */}
        <section>
          <SectionHeader badge="03" title="Butonlar" align="left" />
          <div className="space-y-10">
            {/* Variants */}
            <div>
              <p className="text-xs font-mono text-[var(--foreground-faint)] mb-5 uppercase tracking-widest">Variants</p>
              <div className="flex flex-wrap gap-3">
                <FFButton variant="primary" rightIcon={<ArrowRight size={14} />}>Primary</FFButton>
                <FFButton variant="secondary">Secondary</FFButton>
                <FFButton variant="outline" rightIcon={<Zap size={14} />}>Outline</FFButton>
                <FFButton variant="ghost">Ghost</FFButton>
                <FFButton variant="destructive">Destructive</FFButton>
                <FFButton variant="outline-white" className="bg-[#0C0C0C]">Outline White</FFButton>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <p className="text-xs font-mono text-[var(--foreground-faint)] mb-5 uppercase tracking-widest">Sizes</p>
              <div className="flex flex-wrap items-end gap-3">
                <FFButton size="sm">Small</FFButton>
                <FFButton size="md">Medium</FFButton>
                <FFButton size="lg">Large</FFButton>
                <FFButton size="xl" rightIcon={<ArrowRight size={16} />}>Extra Large</FFButton>
              </div>
            </div>

            {/* States */}
            <div>
              <p className="text-xs font-mono text-[var(--foreground-faint)] mb-5 uppercase tracking-widest">States</p>
              <div className="flex flex-wrap gap-3">
                <FFButton loading>Loading</FFButton>
                <FFButton disabled>Disabled</FFButton>
                <FFButton leftIcon={<Sparkles size={14} />} rightIcon={<ArrowRight size={14} />}>With Icons</FFButton>
                <FFButton fullWidth className="max-w-xs">Full Width</FFButton>
              </div>
            </div>
          </div>
        </section>

        <FFDivider variant="gradient" />

        {/* ── BADGES ─────────────────────────────── */}
        <section>
          <SectionHeader badge="04" title="Badge'ler" align="left" />
          <div className="flex flex-wrap gap-3">
            <FFBadge variant="purple">Purple</FFBadge>
            <FFBadge variant="charcoal">Charcoal</FFBadge>
            <FFBadge variant="outline">Outline</FFBadge>
            <FFBadge variant="success" dot>Active</FFBadge>
            <FFBadge variant="warning">Warning</FFBadge>
            <FFBadge variant="error">Error</FFBadge>
            <FFBadge variant="ai" dot>AI Destekli</FFBadge>
            <FFBadge variant="white">White</FFBadge>
          </div>
        </section>

        <FFDivider variant="gradient" />

        {/* ── CONTAINERS ─────────────────────────── */}
        <section>
          <SectionHeader badge="05" title="Container'lar" align="left" />
          <Grid cols={1} mdCols={2} lgCols={3} gap="md">
            {[
              { border: "subtle" as const, bg: "default" as const, label: "Default Card" },
              { border: "purple" as const, bg: "purple" as const, label: "Purple Accent" },
              { border: "charcoal" as const, bg: "charcoal" as const, label: "Charcoal Dark" },
              { border: "purple" as const, bg: "dark" as const, label: "Dark + Glow", glow: true },
              { border: "white" as const, bg: "glass" as const, label: "Glass Effect" },
              { border: "subtle" as const, bg: "default" as const, label: "Hover Glow", hoverGlow: true },
            ].map((c) => (
              <FFContainer key={c.label} border={c.border} bg={c.bg} glow={c.glow} hoverGlow={c.hoverGlow} padding="lg">
                <p className="text-xs font-mono text-[var(--foreground-faint)] mb-2 uppercase tracking-widest">{c.label}</p>
                <p className="font-display font-bold text-xl text-[var(--foreground)]">
                  Flix<span className="text-[var(--ff-purple)]">Flex</span>
                </p>
                <p className="text-sm text-[var(--foreground-muted)] mt-2">
                  Sharp corners · Premium design · {c.border} border
                </p>
              </FFContainer>
            ))}
          </Grid>
        </section>

        <FFDivider variant="gradient" />

        {/* ── INPUTS ─────────────────────────────── */}
        <section>
          <SectionHeader badge="06" title="Form Elemanları" align="left" />
          <Grid cols={1} mdCols={2} gap="md" className="max-w-2xl">
            <FFInput label="Adınız" placeholder="Ahmet Yılmaz" />
            <FFInput label="E-posta" type="email" placeholder="ahmet@firma.com" />
            <FFInput label="Hata Durumu" placeholder="..." error="Bu alan zorunludur" />
            <FFInput label="İpucu" placeholder="..." hint="Şirket adı opsiyoneldir" />
            <div className="md:col-span-2">
              <FFTextarea label="Mesajınız" placeholder="Projenizden bahsedin..." />
            </div>
          </Grid>
        </section>

        <FFDivider variant="gradient" />

        {/* ── STATS ──────────────────────────────── */}
        <section>
          <SectionHeader badge="07" title="İstatistikler" subtitle="Scroll trigger ile count-up animasyon" />
          <FFStatCounter stats={DEMO_STATS} />
        </section>

        <FFDivider variant="gradient" />

        {/* ── TESTIMONIALS ───────────────────────── */}
        <section>
          <SectionHeader badge="08" title="Referanslar" subtitle="Drag to navigate · Auto-play" />
          <div className="max-w-2xl mx-auto">
            <TestimonialCarousel testimonials={DEMO_TESTIMONIALS} />
          </div>
        </section>

        <FFDivider variant="gradient" />

        {/* ── MARQUEE ────────────────────────────── */}
        <section>
          <SectionHeader badge="09" title="Marquee / Ticker" align="left" />
          <FFMarquee
            items={[
              "Performance Marketing", "Brand Strategy", "Creative Direction",
              "Social Media", "Content Production", "Web & Digital",
              "Data Analytics", "Growth Hacking",
            ].map((t) => <MarqueeTag key={t}><Target size={12} /> {t}</MarqueeTag>)}
          />
        </section>

        <FFDivider variant="gradient" />

        {/* ── BACKGROUND PATHS ───────────────────── */}
        <section>
          <SectionHeader badge="10" title="Background Effects" align="left" />
          <div className="ff-shape-container relative h-64 bg-[#0C0C0C] border border-[var(--border)] overflow-hidden">
            <BackgroundPaths intensity="strong" />
            <div className="relative z-10 h-full flex items-center justify-center">
              <p className="font-display text-3xl font-bold text-white">
                Flix<span className="text-[var(--ff-purple)]">Flex</span>
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-10">
          <FFBadge variant="purple" dot>STEP 02 — Design System Tamamlandı</FFBadge>
          <p className="mt-4 text-sm text-[var(--foreground-faint)]">
            Sıradaki: STEP 03 — Public Site Hero & Navbar
          </p>
        </div>

      </Container>
    </div>
  )
}
