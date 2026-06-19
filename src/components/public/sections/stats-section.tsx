"use client"

import { motion } from "framer-motion"
import { FFStatCounter } from "@/components/ui"
import { Eyebrow } from "@/components/ui/eyebrow"
import { cn } from "@/lib/utils"

const STATS = [
  {
    value: 150,
    suffix: "+",
    label: "Tamamlanan Proje",
    description: "Startup'tan enterprise'a, sektörler ötesi.",
  },
  {
    value: 89,
    suffix: "+",
    label: "Mutlu Müşteri",
    description: "Uzun vadeli ortaklıklara dönüşen ilişkiler.",
  },
  {
    value: 340,
    suffix: "%",
    label: "Ortalama Büyüme",
    description: "İlk 6 ayda ölçülebilir etki, tahmin değil.",
  },
  {
    value: 5,
    suffix: " Yıl",
    label: "Sektör Deneyimi",
    description: "2020'den bu yana — kavrama, denetleme, ölçekleme.",
  },
]

export function StatsSection() {
  return (
    <section
      className={cn(
        "relative bg-[var(--background-alt)] text-[var(--foreground)]",
        "py-20 md:py-28 border-y border-[var(--border)]",
        "overflow-hidden"
      )}
    >
      {/* Subtle dot pattern */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.6] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(var(--border) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-16 max-w-2xl"
        >
          <Eyebrow className="mb-4">Rakamlar konuşur</Eyebrow>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-[1.1] tracking-tight text-[var(--foreground)]">
            Hikâye değil,{" "}
            <span className="text-[var(--ff-purple)]">kanıt.</span>
          </h2>
          <p className="mt-4 text-[var(--foreground-muted)] text-base md:text-lg leading-relaxed">
            Her vaad ölçülebilirdir. İşte FlixFlex müşterilerinin son 24 ayda
            elde ettiği toplam sonuçlar.
          </p>
        </motion.div>

        {/* Counter grid */}
        <FFStatCounter stats={STATS} />
      </div>
    </section>
  )
}
