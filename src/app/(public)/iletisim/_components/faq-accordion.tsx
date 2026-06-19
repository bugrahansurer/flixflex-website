"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "@/lib/icons"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/ui/eyebrow"
import { staggerContainer, fadeInUp, accordionContent } from "@/lib/animations"

const FAQ_ITEMS = [
  {
    q: "Bir proje ne kadar sürer?",
    a: "Proje kapsamına göre değişir. Bir marka kimliği projesi genellikle 3-6 hafta, sosyal medya yönetimi aylık yenilenen bir süreç, performans kampanyaları ise birkaç günde yayına alınabilir. İlk görüşmede net bir zaman planı paylaşırız.",
  },
  {
    q: "Minimum bütçe var mı?",
    a: "Hizmet türüne göre farklılık gösterir. Sosyal medya yönetimi için aylık 5.000 ₺'den, performans kampanyaları için 10.000 ₺'den başlayan paketlerimiz mevcut. Özel ihtiyaçlarınız için bize yazın, birlikte en uygun çözümü bulalım.",
  },
  {
    q: "Türkiye dışındaki markalarla çalışıyor musunuz?",
    a: "Evet. Mevcut müşterilerimizin bir kısmı Avrupa ve Orta Doğu pazarlarında faaliyet gösteriyor. Tüm görüşmeleri ve raporlamaları Türkçe veya İngilizce olarak yürütebiliyoruz.",
  },
  {
    q: "Sözleşme zorunlu mu?",
    a: "Evet, tüm projeler için yazılı bir hizmet sözleşmesi imzalıyoruz. Bu hem sizin hem bizim güvencemiz. Sözleşme kapsamı, teslimat takvimleri ve ödeme planını net şekilde belirtir.",
  },
  {
    q: "Süreç nasıl işliyor? İlk adım nedir?",
    a: "Formu doldurup gönderdiğinizde 24 saat içinde size ulaşıyoruz. Ardından 30-45 dakikalık ücretsiz bir keşif görüşmesi planlıyoruz. Bu görüşmede ihtiyaçlarınızı, bütçenizi ve hedeflerinizi anlayarak size özel bir teklif hazırlıyoruz.",
  },
]

function FaqItem({
  question,
  answer,
  itemId,
}: {
  question: string
  answer: string
  itemId: string
}) {
  const [open, setOpen] = useState(false)
  const triggerId = `faq-trigger-${itemId}`
  const panelId = `faq-panel-${itemId}`

  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      <button
        type="button"
        id={triggerId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between gap-4",
          "py-5 text-left",
          "text-[var(--foreground)] hover:text-[var(--ff-purple)]",
          "transition-colors duration-150 group"
        )}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="font-display font-semibold text-sm md:text-base leading-snug">
          {question}
        </span>
        <span
          className={cn(
            "ff-shape-button w-7 h-7 shrink-0 flex items-center justify-center",
            "border border-[var(--border)]",
            "group-hover:border-[var(--ff-purple)] group-hover:text-[var(--ff-purple)]",
            "transition-colors duration-150",
            open && "border-[var(--ff-purple)] text-[var(--ff-purple)]"
          )}
        >
          {open ? <Minus size={13} /> : <Plus size={13} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="content"
            variants={accordionContent}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            role="region"
            aria-labelledby={triggerId}
          >
            <p className="pb-5 text-sm text-[var(--foreground-muted)] leading-relaxed pr-10">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FaqAccordion() {
  return (
    <section className="bg-[var(--background)] py-20 md:py-28 border-t border-[var(--border)]">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left: heading */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="lg:col-span-4"
          >
            <motion.div variants={fadeInUp} className="mb-3">
              <Eyebrow>SSS</Eyebrow>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="font-display text-2xl md:text-3xl font-extrabold text-[var(--foreground)] leading-tight"
            >
              Sıkça Sorulan{" "}
              <span className="text-[var(--ff-purple)]">Sorular</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-sm text-[var(--foreground-muted)] leading-relaxed"
            >
              Cevap bulamadığınız sorularınız için{" "}
              <a
                href="mailto:hello@flixflex.com"
                className="text-[var(--ff-purple)] hover:underline"
              >
                hello@flixflex.com
              </a>{" "}
              adresine yazabilirsiniz.
            </motion.p>
          </motion.div>

          {/* Right: accordion */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="lg:col-span-8"
          >
            {FAQ_ITEMS.map((item, idx) => (
              <motion.div key={item.q} variants={fadeInUp}>
                <FaqItem
                  question={item.q}
                  answer={item.a}
                  itemId={`item-${idx}`}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
