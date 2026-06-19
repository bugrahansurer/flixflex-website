"use client"

import { motion } from "framer-motion"
import { Zap, ShieldCheck, BarChart2, MessageCircle } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/ui/eyebrow"
import { staggerContainer, fadeInUp } from "@/lib/animations"

const CARDS = [
  {
    icon: Zap,
    title: "Hızlı Yanıt",
    body: "Her briefi 24 saat içinde inceliyoruz. Acil projeler için öncelikli hat mevcuttur.",
  },
  {
    icon: BarChart2,
    title: "Veri Odaklı",
    body: "Strateji, sezgi değil ölçüm üzerine kurulu. Her karar arkasında veri vardır.",
  },
  {
    icon: ShieldCheck,
    title: "Şeffaf Süreç",
    body: "Gizli maliyet yok. Proje başlamadan önce kapsam, süre ve bütçe netleşir.",
  },
  {
    icon: MessageCircle,
    title: "Tek Temas Noktası",
    body: "Projenizin başından sonuna kadar aynı ekip hesap verilebilirlikle yanınızda.",
  },
]

export function WhyUs() {
  return (
    <section className="bg-[var(--surface)] py-20 md:py-28 border-t border-[var(--border)]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-12"
        >
          <motion.div variants={fadeInUp} className="mb-3">
            <Eyebrow>Neden FlixFlex</Eyebrow>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="font-display text-2xl md:text-4xl font-extrabold text-[var(--foreground)] leading-tight max-w-lg"
          >
            Fark yaratan{" "}
            <span className="text-[var(--ff-purple)]">4 sebep</span>
          </motion.h2>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2"
        >
          {CARDS.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              variants={fadeInUp}
              className={cn(
                "ff-shape-container flex flex-col gap-4 p-7",
                "border-[var(--border)]",
                i < CARDS.length - 1 && "border-r",
                "border border-[var(--border)] hover:bg-[var(--background)] transition-colors duration-200 group"
              )}
            >
              <span
                className={cn(
                  "ff-shape-container w-10 h-10 flex items-center justify-center shrink-0",
                  "border border-[var(--ff-purple)]/30 bg-[var(--ff-purple)]/10",
                  "group-hover:bg-[var(--ff-purple)]/10 transition-colors duration-200"
                )}
              >
                <Icon size={18} className="text-[var(--ff-purple)]" />
              </span>
              <div>
                <h3 className="font-display font-bold text-[var(--foreground)] text-base mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                  {body}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
