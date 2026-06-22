"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/ui/eyebrow"
import { TestimonialCarousel } from "@/components/ui/testimonial"
import type { Testimonial } from "@/components/ui/testimonial"
import { staggerContainer, fadeInUp } from "@/lib/animations"

// ── Demo data — 6 realistic Turkish testimonials ─────────────
const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Elif Şahin",
    role: "CMO",
    company: "Novatek Yazılım",
    content:
      "FlixFlex ile çalışmaya başladıktan sonra marka bilinirliğimiz 3 ayda %180 arttı. Performans pazarlamasındaki titizlikleri ve yaratıcı yaklaşımları bizi rakiplerimizden net biçimde ayırdı.",
    rating: 5,
  },
  {
    id: 2,
    name: "Mert Yıldırım",
    role: "Kurucu & CEO",
    company: "Orbitly SaaS",
    content:
      "Başlangıç aşamasındayken FlixFlex bize kurumsal bir ajansın vereceği kalitede hizmet sundu. Brief'imizi tam olarak anladılar ve beklentilerimizin çok ötesine geçtiler.",
    rating: 5,
  },
  {
    id: 3,
    name: "Selin Koç",
    role: "Marka Müdürü",
    company: "Lümen Tekstil",
    content:
      "Sosyal medya yönetiminde gördüğümüz dönüşüm inanılmazdı. İçerik stratejisi ve topluluk büyütme konusunda FlixFlex gerçek bir uzman — her ay tutarlı büyüme elde ediyoruz.",
    rating: 5,
  },
  {
    id: 4,
    name: "Ahmet Demir",
    role: "Genel Müdür",
    company: "Prizma Gayrimenkul",
    content:
      "Yeni kimlik çalışmamız tamamen FlixFlex'in elinden çıktı. Logo'dan web sitesine, kampanya materyallerinden dijital reklamlara kadar her detayda markanın ruhunu yakaladılar.",
    rating: 5,
  },
  {
    id: 5,
    name: "Ceren Arslan",
    role: "Dijital Pazarlama Direktörü",
    company: "Helix E-ticaret",
    content:
      "ROAS hedeflerimizi sürekli aştılar. Google ve Meta kampanyalarında gösterdikleri veri odaklı yaklaşım sayesinde reklam harcamalarımızın verimliliği %240 yükseldi.",
    rating: 5,
  },
  {
    id: 6,
    name: "Kerem Yılmaz",
    role: "Co-Founder",
    company: "Waveform Stüdyo",
    content:
      "İçerik prodüksiyon sürecinde gösterdikleri profesyonellik ve hız bizi çok etkiledi. Vizyonumuzu anında kavradılar ve teslimat takvimine tam uyum sağladılar.",
    rating: 5,
  },
]

// ── Section ────────────────────────────────────────────────────
export function TestimonialsSection() {
  return (
    <section
      className={cn(
        "relative bg-[var(--background)] text-[var(--foreground)]",
        "py-20 md:py-28 overflow-hidden"
      )}
    >
      {/* Dot pattern background */}
      <div
        aria-hidden
        className="absolute inset-0 ff-dot-bg opacity-60 pointer-events-none"
      />

      {/* Soft purple aura — centre */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[56rem] h-[56rem] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255, 79, 216,0.1) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />

      {/* Purple aura — top-right accent */}
      <div
        aria-hidden
        className="absolute -top-20 right-0 w-[32rem] h-[32rem] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 79, 216,0.08) 0%, transparent 60%)",
          filter: "blur(48px)",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        {/* ── Section header ────────────────────────── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-14 md:mb-20 text-center"
        >
          {/* Eyebrow */}
          <motion.div variants={fadeInUp} className="mb-5">
            <Eyebrow align="center">Referanslar</Eyebrow>
          </motion.div>

          {/* Heading */}
          <motion.h2
            variants={fadeInUp}
            className={cn(
              "font-display font-extrabold leading-[1.08] tracking-tight",
              "text-[clamp(32px,5vw,64px)]",
              "text-[var(--foreground)]"
            )}
          >
            Müşterilerimiz{" "}
            <span className="text-[var(--ff-purple)]">Anlatıyor</span>
          </motion.h2>

          {/* Sub-copy */}
          <motion.p
            variants={fadeInUp}
            className="mt-5 text-[var(--foreground-muted)] text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Sonuçlara bırakıyoruz söylemi. Birlikte büyüyen markalar,
            kendi deneyimlerini aktarıyor.
          </motion.p>

          {/* Decorative rule */}
          <motion.div
            variants={fadeInUp}
            className="mt-8 mx-auto flex items-center justify-center gap-3 w-fit"
            aria-hidden
          >
            <span className="h-px w-12 bg-[var(--border)]" />
            <span className="w-1.5 h-1.5 bg-[var(--ff-purple)]" />
            <span className="h-px w-12 bg-[var(--border)]" />
          </motion.div>
        </motion.div>

        {/* ── Carousel ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="mx-auto max-w-3xl"
        >
          <TestimonialCarousel
            testimonials={TESTIMONIALS}
            autoPlay
            interval={3500}
          />
        </motion.div>
      </div>
    </section>
  )
}
