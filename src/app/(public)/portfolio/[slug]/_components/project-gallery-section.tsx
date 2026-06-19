"use client"

import { motion } from "framer-motion"
import { fadeInUp, staggerContainer } from "@/lib/animations"
import { cn } from "@/lib/utils"
import { ProjectGallery } from "@/components/public/portfolio/gallery"
import { Eyebrow } from "@/components/ui/eyebrow"
import type { PortfolioItem } from "@/components/public"

interface ProjectGallerySectionProps {
  project: PortfolioItem
}

export function ProjectGallerySection({ project }: ProjectGallerySectionProps) {
  // No admin-uploaded gallery images → hide the section entirely.
  const images = (project.images ?? []).filter(Boolean)
  if (images.length === 0) return null

  return (
    <section
      className={cn(
        "relative bg-[var(--surface)] text-[var(--foreground)]",
        "py-20 md:py-28 overflow-hidden border-y border-[var(--border)]"
      )}
    >
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-12"
        >
          <motion.div variants={fadeInUp} className="mb-3">
            <Eyebrow>Görsel Galeri</Eyebrow>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="font-display text-3xl md:text-5xl font-extrabold leading-[1.05] tracking-tighter"
          >
            Projeye yakından{" "}
            <span className="text-[var(--ff-purple)]">bakın.</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-3 text-[var(--foreground-muted)] text-base max-w-xl leading-relaxed"
          >
            Süreç boyunca üretilen çalışmalardan seçili kareler.
          </motion.p>
        </motion.div>

        <ProjectGallery
          gradient={project.gradient}
          accentColor={project.accentColor}
          title={project.title}
          images={images}
        />
      </div>
    </section>
  )
}
