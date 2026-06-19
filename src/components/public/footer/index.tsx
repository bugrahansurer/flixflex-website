"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight, Mail, MapPin } from "@/lib/icons"
import { staggerContainer, fadeInUp } from "@/lib/animations"
import { cn } from "@/lib/utils"
import { FOOTER_COLUMNS, SOCIAL_LINKS } from "./footer-data"
import { SocialIcon } from "./social-icon"
import { BackToTop } from "./back-to-top"
import { FlixFlexLogo } from "../navbar/logo"
import { StarField } from "@/components/ui/star-field"


export function FlixFlexFooter({ siteSettings = {} }: { siteSettings?: Record<string, string> }) {
  return (

    <>
      <footer
        className={cn(
          "relative bg-[var(--surface)] text-[var(--foreground)]",
          "border-t border-[var(--border)]",
          "overflow-hidden"
        )}
      >
        {/* Deep-space starfield (replaces the old grid pattern) */}
        <StarField className="z-0 opacity-90" density={0.0001} />

        {/* Subtle accent glows — minimal, tucked into the corners */}
        <div
          aria-hidden
          className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,79,216,0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          aria-hidden
          className="absolute -top-16 right-8 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,79,216,0.08) 0%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 pt-20 pb-10">
          {/* ── Mid: brand + columns ───────────────── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-2 md:grid-cols-6 gap-10 pb-12 border-b border-[var(--border)]"
          >
            {/* Brand block */}
            <motion.div variants={fadeInUp} className="col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <FlixFlexLogo
                  logoUrl={siteSettings.site_logo}
                  logoHeight={siteSettings.site_logo_height ? parseInt(siteSettings.site_logo_height) : 24}
                />
              </div>
              <p className="text-sm text-[var(--foreground-muted)] leading-relaxed max-w-xs mb-6">
                Hız. Güç. Esneklik. Markaları bir sonraki seviyeye taşıyan
                next-gen reklam ajansı.
              </p>

              {/* Contact mini */}
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2 text-[var(--foreground-muted)]">
                  <Mail size={14} className="text-[var(--ff-charcoal)]" />
                  <a
                    href="mailto:hello@flixflex.com"
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    hello@flixflex.com
                  </a>
                </li>
                <li className="flex items-center gap-2 text-[var(--foreground-muted)]">
                  <MapPin size={14} className="text-[var(--ff-charcoal)]" />
                  <span>Levent, İstanbul · Türkiye</span>
                </li>
              </ul>
            </motion.div>

            {/* Columns */}
            {FOOTER_COLUMNS.map((col) => (
              <motion.div key={col.title} variants={fadeInUp}>
                <h3 className="text-[12px] font-bold text-[var(--foreground-faint)] underline mb-4">
                  {col.title}
                </h3>
                <ul className="space-y-1">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "group inline-flex items-center gap-1.5 text-xs",
                          "text-[var(--foreground-muted)] hover:text-[var(--ff-purple)] transition-colors duration-200"
                        )}
                      >
                        {link.label}
                        <ArrowUpRight
                          size={12}
                          className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Bottom bar ────────────────────────── */}
          <div className="mt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Copyright */}
            <p className="text-xs text-[var(--foreground-faint)] tracking-wide">
              © {new Date().getFullYear()} FlixFlex Reklam Ajansı.{" "}
              <span className="text-[var(--foreground-muted)]">Tüm hakları saklıdır.</span>
            </p>

            {/* Social */}
            <ul className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={cn(
                      "ff-shape-button w-9 h-9 flex items-center justify-center",
                      "border border-[var(--border)] text-[var(--foreground-muted)]",
                      "hover:border-[var(--ff-purple)] hover:text-[var(--ff-purple)]",
                      "hover:bg-[rgba(var(--ff-purple)/0.08)]",
                      "transition-colors duration-200"
                    )}
                  >
                    <SocialIcon icon={social.icon} />
                  </a>
                </li>
              ))}
            </ul>

            {/* Locale */}
            <div className="flex items-center gap-2 text-[11px] text-[var(--foreground-faint)]">
              <span className="ff-shape-container w-1.5 h-1.5 bg-[var(--ff-purple)] animate-pulse" />
              <span>FlixFlex · İstanbul, Türkiye</span>
            </div>
          </div>
        </div>
      </footer>

      <BackToTop />
    </>
  )
}
