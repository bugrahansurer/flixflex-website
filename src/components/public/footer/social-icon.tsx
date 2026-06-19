import { Instagram, Linkedin, Twitter, Youtube } from "@/lib/icons"
import type { SocialLink } from "./footer-data"

const iconMap = {
  instagram: Instagram,
  linkedin:  Linkedin,
  x:         Twitter,
  youtube:   Youtube,
  behance:   Twitter, // lucide doesn't ship Behance — placeholder
} as const

export function SocialIcon({
  icon,
  size = 16,
}: {
  icon: SocialLink["icon"]
  size?: number
}) {
  const Icon = iconMap[icon] ?? Twitter
  return <Icon size={size} aria-hidden />
}
