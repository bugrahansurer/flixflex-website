"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/ui/eyebrow"
import { fadeInUp, staggerContainer } from "@/lib/animations"

// ── Quick facts / timeline data ───────────────────────
const FACTS = [
  { year: "2020", label: "Kuruluş", detail: "İstanbul, Türkiye" },
  { year: "50+",  label: "Aktif Müşteri", detail: "Startup'tan holdinge" },
  { year: "150+", label: "Tamamlanan Proje", detail: "Türkiye & MENA bölgesi" },
  { year: "8",    label: "Kişilik Ekip", detail: "Tam kadrolu uzmanlar" },
  { year: "340%", label: "Ort. Büyüme", detail: "İlk 6 ayda ölçülen ortalama" },
]

// ── Fact item ─────────────────────────────────────────
function FactItem({
  year,
  label,
  detail,
  index,
}: {
  year: string
  label: string
  detail: string
  index: number
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className={cn(
        "ff-shape-container relative flex items-center justify-center h-20 gap-3 p-3",
        "border border-[var(--border)]",
      )}
    >
      {/* Left accent line */}
      <span
        aria-hidden
        className="flex items-center justify-center absolute left-0 top-0 bottom-0 w-px bg-[var(--border)] group-hover:bg-[var(--ff-purple)] transition-colors"
      />

      {/* Year / value */}
      <div className="flex items-center w-20 shrink-0">
        <span className="font-display font-extrabold text-2xl md:text-3xl text-[var(--ff-purple)] leading-none tabular-nums">
          {year}
        </span>
      </div>

      {/* Label + detail */}
      <div>
        <p className="font-semibold text-sm md:text-base text-[var(--foreground)] leading-tight">
          {label}
        </p>
        <p className="text-xs md:text-sm text-[var(--foreground-faint)] mt-0.5">
          {detail}
        </p>
      </div>

      {/* Index number — decorative */}
      <span className="ml-auto font-mono text-[10px] text-[var(--foreground-faint)] tracking-[0.1em] self-center">
        {String(index + 1).padStart(2, "0")}
      </span>
    </motion.div>
  )
}

// ── Section ───────────────────────────────────────────
const DEFAULT_STORY_PARAGRAPHS = [
  "FlixFlex, 2020 yılında İstanbul'da bir garaj ofisinde, iki kişilik bir ekibin \"neden Türk markalar dijitalde hak ettiği yerde değil?\" sorusundan doğdu. Cevap ne şablonlarda ne de ajans klişelerindeydi; cesaret, strateji ve veriydi.",
  "İlk yılımızda 5 startup ile çalıştık — bütçeler küçük, hedefler büyüktü. Her bütçeyi sanki kendi paramızmış gibi harcadık, her sonucu şeffaf raporladık. Kulaktan kulağa yayılan itibar, bugün 50+ aktif müşteri portföyüne dönüştü.",
  "Bugün FlixFlex; strateji, yaratıcılık ve performans pazarlamasını tek çatı altında birleştiren 8 kişilik bir ekip. Biz sadece reklam yapmıyoruz — markaları bir sonraki seviyeye taşıyoruz.",
]

interface StorySectionProps {
  eyebrow?: string
  headline?: string
  paragraphs?: string[]
}

export function StorySection({ eyebrow, headline, paragraphs }: StorySectionProps = {}) {
  const paras = paragraphs && paragraphs.length > 0 ? paragraphs : DEFAULT_STORY_PARAGRAPHS
  return (
    <section
      className={cn(
        "relative bg-[var(--background-alt)] text-[var(--foreground)]",
        "py-20 md:py-28",
        "border-y border-[var(--border)]",
        "overflow-hidden"
      )}
    >
      {/* Dot background */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.5]"
        style={{
          backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* ── Left: Story narrative ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Eyebrow */}
            <Eyebrow className="mb-5">{eyebrow ?? "Hikâyemiz"}</Eyebrow>

            {/* Headline */}
            <h2
              className={cn(
                "font-display font-extrabold leading-[1.08] tracking-[-0.03em]",
                "text-[clamp(2rem,4.5vw,3.5rem)]",
                "mb-8"
              )}
            >
              {headline ?? (
                <>
                  Sıfırdan değil,{" "}
                  <span className="text-[var(--ff-purple)]">sıfırı</span>{" "}
                  domine ederek.
                </>
              )}
            </h2>

            {/* Body paragraphs */}
            <div className="space-y-5 text-base md:text-lg text-[var(--foreground-muted)] leading-relaxed">
              {paras.map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {para}
                </motion.p>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Quick facts / timeline ── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="relative"
          >
            {/* Header */}
            <motion.div
              variants={fadeInUp}
              className="mb-8"
            >
              <Eyebrow className="mb-2">Rakamlarla FlixFlex</Eyebrow>
              <h3 className="font-display text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight">
                5 yılda ne yaptık
              </h3>
            </motion.div>

            {/* Facts list */}
            <div className="space-y-2">
              {FACTS.map((fact, i) => (
                <FactItem
                  key={fact.label}
                  year={fact.year}
                  label={fact.label}
                  detail={fact.detail}
                  index={i}
                />
              ))}
            </div>

            {/* Purple decorative corner */}
            <div
              aria-hidden
              className="absolute -bottom-8 -right-8 w-32 h-32 pointer-events-none opacity-60"
              style={{
                background:
                  "radial-gradient(circle at 100% 100%, rgba(255, 79, 216,0.2) 0%, transparent 70%)",
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
