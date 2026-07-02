"use client"

import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Clock } from "@/lib/icons"
import { getSocialIcon, DEFAULT_SOCIAL_LINKS, type SocialLinkItem } from "@/lib/social-platforms"
import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/ui/eyebrow"
import { staggerContainer, fadeInUp } from "@/lib/animations"

// ── Decorative floating shapes (right-panel visual) ───────
function ContactDecor() {
  return (
    <div aria-hidden className="relative h-48 w-full mt-4 overflow-hidden">
      {/* Outer border box */}
      <motion.div
        className="ff-shape-container absolute inset-4 border border-[rgba(255, 79, 216,0.22)]"
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: 6, opacity: 1 }}
        transition={{ duration: 1.0, delay: 0.5 }}
      />
      {/* Inner offset box */}
      <motion.div
        className="ff-shape-container absolute inset-8 border border-[var(--border-strong)]"
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: -3, opacity: 1 }}
        transition={{ duration: 1.0, delay: 0.7 }}
      />
      {/* Central card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(
          "ff-shape-container absolute inset-12 bg-[var(--surface-elevated)]",
          "border border-[var(--border)]",
          "flex flex-col items-center justify-center gap-2",
          "shadow-[0_16px_48px_-12px_rgba(255, 79, 216,0.25)]"
        )}
      >
        {/* Pulsing dot + label */}
        <span className="flex items-center gap-2 text-[10px] text-[var(--foreground-faint)]">
          <span className="w-1.5 h-1.5 bg-[var(--ff-purple)] animate-pulse" />
          Şu an müsaitiz
        </span>
        <p className="font-display font-bold text-[var(--foreground)] text-sm">
          İstanbul, TR
        </p>
        {/* Animated response bar */}
        <div className="w-3/4 h-1 bg-[var(--border)] mt-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "88%" }}
            transition={{ delay: 1.3, duration: 1.0, ease: "easeOut" }}
            className="h-full bg-[var(--ff-purple)]"
          />
        </div>
        <p className="text-[9px] text-[var(--foreground-faint)]">
          Yanıt oranı: 88%
        </p>
      </motion.div>

      {/* Purple aura */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255, 79, 216,0.08) 0%, transparent 70%)",
        }}
      />
    </div>
  )
}

export interface ContactInfoProps {
  email?: string
  phone?: string
  address?: string
  workingHours?: string
  /** admin → Ayarlar → Site → site_social_links (parseSocialLinks ile çözülmüş). */
  social?: SocialLinkItem[]
}

// ── Main component ─────────────────────────────────────────
// Değerler admin → Ayarlar → Site'den gelir (prop). Boşsa mevcut varsayılanlara düşer.
export function ContactInfo({ email, phone, address, workingHours, social }: ContactInfoProps = {}) {
  const emailVal = email?.trim() || "iletisim@flixflex.com"
  const phoneVal = phone?.trim() || "+90 532 383 35 54"
  const addressVal = address?.trim() || "Mutsan Mh. İkitelli Sk. No:14 D:41, İstanbul"
  const hoursVal = workingHours?.trim() || "Pazartesi – Cuma · 09:00 – 18:00"
  const socialList = social && social.length > 0 ? social.filter((s) => s?.url) : DEFAULT_SOCIAL_LINKS

  const details = [
    { icon: Mail, label: "E-posta", value: emailVal, href: `mailto:${emailVal}` },
    { icon: Phone, label: "Telefon", value: phoneVal, href: `tel:${phoneVal.replace(/[^\d+]/g, "")}` },
    { icon: MapPin, label: "Adres", value: addressVal, href: null as string | null },
    { icon: Clock, label: "Çalışma Saatleri", value: hoursVal, href: null as string | null },
  ]

  return (
    <motion.aside
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={cn(
        "ff-shape-container ff-card h-full flex flex-col gap-0",
      )}
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="mb-8">
        <Eyebrow className="mb-3">Bize Ulaşın</Eyebrow>
        <h2 className="font-display text-2xl font-extrabold text-[var(--foreground)] leading-tight">
          Doğrudan konuşmayı<br />
          <span className="text-[var(--ff-purple)]">tercih eder misiniz?</span>
        </h2>
        <p className="mt-3 text-sm text-[var(--foreground-faint)] leading-relaxed">
          Formu doldurmak yerine bize doğrudan yazabilir ya da arayabilirsiniz.
          Tüm kanallardan ulaşabilirsiniz.
        </p>
      </motion.div>

      {/* Contact details */}
      <motion.ul variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {details.map(({ icon: Icon, label, value, href }) => (
          <motion.li
            key={label}
            variants={fadeInUp}
            className="flex items-start gap-4"
          >
            <span
              className={cn(
                "ff-shape-button mt-0.5 w-9 h-9 shrink-0",
                "flex items-center justify-center",
                "border border-[var(--ff-purple)]/30 bg-[var(--ff-purple)]/10"
              )}
            >
              <Icon size={14} className="text-xs text-[var(--ff-purple)]" />
            </span>
            <div>
              <p className="text-[10px] font-semibold text-[var(--foreground-faint)] mb-0.5">
                {label}
              </p>
              {href ? (
                <a
                  href={href}
                  className="text-xs text-[var(--foreground)] hover:text-[var(--ff-purple)] transition-colors duration-150"
                >
                  {value}
                </a>
              ) : (
                <p className="text-xs text-[var(--foreground)]">{value}</p>
              )}
            </div>
          </motion.li>
        ))}
      </motion.ul>

      {/* Response time badge */}
      <motion.div
        variants={fadeInUp}
        className={cn(
          "ff-shape-container flex items-center h-fit gap-3 px-4 py-2 mb-8",
          "border-l-2 border-l-[var(--ff-purple)] bg-[rgba(255, 79, 216,0.06)]",
          "border border-[var(--ff-purple)]/18"
        )}
      >
        <span className="w-1.5 h-1.5 bg-[var(--ff-purple)] animate-pulse shrink-0" />
        <p className="text-[11px] text-[var(--foreground-muted)] leading-snug">
          <span className="font-semibold text-[var(--foreground)]">24 saat</span> içinde yanıt garantisi.
          Acil projeler için öncelikli hat mevcuttur.
        </p>
      </motion.div>

      {/* Social links */}
      <motion.div variants={fadeInUp}>
        <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[var(--foreground-faint)] mb-3">
          Sosyal Medya
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {socialList.map((s, i) => {
            const Icon = getSocialIcon(s.platform)
            return (
              <li key={`${s.platform}-${i}`}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group flex items-center gap-3",
                    "text-sm text-[var(--foreground-muted)]",
                    "hover:text-[var(--ff-purple)] transition-colors duration-150"
                  )}
                >
                  <span
                    className={cn(
                      "ff-shape-button w-8 h-8 flex items-center justify-center shrink-0",
                      "border border-[var(--border)]",
                      "group-hover:border-[var(--ff-purple)] group-hover:bg-[var(--ff-purple)]/8",
                      "transition-colors duration-150"
                    )}
                  >
                    <Icon size={14} />
                  </span>
                  <span>{s.label}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </motion.div>

      {/* Decorative visual */}
      <ContactDecor />
    </motion.aside>
  )
}
