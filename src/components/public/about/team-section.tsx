"use client"

import Link from "next/link"
import { useRef } from "react"
import { motion } from "framer-motion"
import { ExternalLink } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { fadeInUp, staggerContainer } from "@/lib/animations"
import { TiltCard } from "@/components/ui/tilt-card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { TEAM, type TeamMember } from "./about-data"

// ── Individual team card ──────────────────────────────
function TeamCard({ member }: { member: TeamMember }) {
  return (
    <motion.div variants={fadeInUp}>
      <TiltCard variant="glass" className="flex flex-col gap-4 p-5 md:p-6">
        {/* Purple accent top border */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[var(--ff-purple)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Avatar — initial in mor square */}
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "ff-shape-container w-14 h-14 flex items-center justify-center",
              "font-display font-extrabold text-lg",
              "transition-[box-shadow] duration-300",
              member.accent
                ? "bg-[var(--ff-purple)] text-white border border-[var(--ff-purple)]"
                : "bg-[var(--surface)] text-[var(--ff-purple)] border border-[var(--ff-purple)]/30",
              "group-hover:shadow-[0_0_20px_var(--ff-purple)]/50"
            )}
          >
            {member.initials}
          </div>

          {/* Social link */}
          {member.links?.[0] && (
            <a
              href={member.links[0].href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name} — ${member.links[0].label}`}
              className={cn(
                "w-8 h-8 flex items-center justify-center",
                "border border-[var(--border)]",
                "text-[var(--foreground-faint)]",
                "transition-[background-color,border-color,color] duration-200",
                "hover:bg-[var(--ff-purple)] hover:border-[var(--ff-purple)] hover:text-white",
                "opacity-0 group-hover:opacity-100"
              )}
            >
              <ExternalLink size={13} strokeWidth={2} />
            </a>
          )}
        </div>

        {/* Name + role */}
        <div>
          <p className="font-display font-bold text-base md:text-lg text-[var(--foreground)] leading-tight tracking-tight">
            {member.name}
          </p>
          <p className="text-xs font-medium text-[var(--ff-purple)] mt-0.5 tracking-[0.05em]">
            {member.role}
          </p>
        </div>

        {/* Bio */}
        {member.bio && (
          <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
            {member.bio}
          </p>
        )}
      </TiltCard>
    </motion.div>
  )
}

// ── Section ────────────────────────────────────────────
interface TeamSectionProps {
  eyebrow?: string
  headline?: string
  subheadline?: string
  members?: TeamMember[]
}

export function TeamSection({ eyebrow, headline, subheadline, members }: TeamSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null)
  const list = members && members.length > 0 ? members : TEAM

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative bg-[var(--background-alt)] text-[var(--foreground)]",
        "py-20 md:py-28",
        "border-y border-[var(--border)]",
        "overflow-hidden"
      )}
    >
      {/* Dot pattern */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.45]"
        style={{
          backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 50% 50%, black 10%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-14 md:mb-20 text-center"
        >
          <Eyebrow align="center" className="mb-4">{eyebrow ?? "Ekibimiz"}</Eyebrow>
          <h2
            className={cn(
              "font-display font-extrabold leading-[1.08] tracking-[-0.03em]",
              "text-[clamp(2rem,4.5vw,3.5rem)]",
              "text-[var(--foreground)]"
            )}
          >
            {headline ?? (
              <>
                Arkamızda{" "}
                <span className="text-[var(--ff-purple)]">insanlar</span> var.
              </>
            )}
          </h2>
          <p className="mt-5 text-base md:text-lg text-[var(--foreground-muted)] max-w-2xl mx-auto leading-relaxed">
            {subheadline ??
              "Strateji, yaratıcılık, veri ve üretim — hepsi tek bir kompakt, güçlü ekipte birleşiyor."}
          </p>
        </motion.div>

        {/* Team grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6"
        >
          {list.map((member) => (
            <TeamCard key={member.name} member={member} />
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 text-center text-xs text-[var(--foreground-faint)]"
        >
          + Büyümeye devam ediyoruz — ekibimize katılmak için{" "}
          <Link
            href="/iletisim"
            className="text-[var(--ff-purple)] underline underline-offset-2 hover:no-underline transition-all"
          >
            bize ulaşın
          </Link>
          .
        </motion.p>
      </div>
    </section>
  )
}
