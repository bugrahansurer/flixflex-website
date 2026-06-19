// ═══════════════════════════════════════════════════════════
// FlixFlex — Social Platforms Catalog
//
// Single source of truth for the social platforms the site supports.
// Used by:
//   • Admin site-settings form (the add/remove platform picker)
//   • Public footer (rendering the social icon row)
//
// Social links are stored in site_settings under the JSON key
// `site_social_links` as an array of SocialLinkItem. Adding a new
// platform = add one entry to SOCIAL_PLATFORMS + ICON_MAP below.
// ═══════════════════════════════════════════════════════════

import {
  Instagram, Linkedin, Twitter, Youtube, BrandX, Facebook, Tiktok,
  Threads, Behance, Dribbble, Pinterest, Github, Whatsapp, Telegram,
  Globe, type LucideIcon,
} from "@/lib/icons"

export interface SocialLinkItem {
  /** Platform key — matches a SOCIAL_PLATFORMS entry (e.g. "instagram"). */
  platform: string
  /** Display label / accessible name (e.g. "Instagram"). */
  label: string
  /** Full profile URL. */
  url: string
}

/** Platforms selectable in the admin picker. */
export const SOCIAL_PLATFORMS: { key: string; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "x",         label: "X (Twitter)" },
  { key: "linkedin",  label: "LinkedIn" },
  { key: "youtube",   label: "YouTube" },
  { key: "facebook",  label: "Facebook" },
  { key: "tiktok",    label: "TikTok" },
  { key: "threads",   label: "Threads" },
  { key: "behance",   label: "Behance" },
  { key: "dribbble",  label: "Dribbble" },
  { key: "pinterest", label: "Pinterest" },
  { key: "github",    label: "GitHub" },
  { key: "whatsapp",  label: "WhatsApp" },
  { key: "telegram",  label: "Telegram" },
]

const ICON_MAP: Record<string, LucideIcon> = {
  instagram: Instagram,
  x:         BrandX,
  twitter:   Twitter,
  linkedin:  Linkedin,
  youtube:   Youtube,
  facebook:  Facebook,
  tiktok:    Tiktok,
  threads:   Threads,
  behance:   Behance,
  dribbble:  Dribbble,
  pinterest: Pinterest,
  github:    Github,
  whatsapp:  Whatsapp,
  telegram:  Telegram,
}

/** Resolve a platform key to its icon component (falls back to a globe). */
export function getSocialIcon(platform: string): LucideIcon {
  return ICON_MAP[(platform || "").toLowerCase()] ?? Globe
}

/** Human label for a platform key (falls back to the raw key). */
export function platformLabel(platform: string): string {
  return SOCIAL_PLATFORMS.find((p) => p.key === platform)?.label ?? platform
}

/** Default links used when the site has not configured any yet. */
export const DEFAULT_SOCIAL_LINKS: SocialLinkItem[] = [
  { platform: "instagram", label: "Instagram", url: "https://instagram.com/flixflex" },
  { platform: "linkedin",  label: "LinkedIn",  url: "https://linkedin.com/company/flixflex" },
  { platform: "x",         label: "X",         url: "https://x.com/flixflex" },
  { platform: "youtube",   label: "YouTube",   url: "https://youtube.com/@flixflex" },
]

/**
 * Parse the raw `site_social_links` setting value (JSON string) into a
 * clean SocialLinkItem[]. Returns the provided fallback when the value is
 * missing/blank; returns an explicit empty array when the admin cleared it.
 */
export function parseSocialLinks(
  raw: string | undefined | null,
  fallback: SocialLinkItem[] = DEFAULT_SOCIAL_LINKS,
): SocialLinkItem[] {
  if (raw == null || raw.trim() === "") return fallback
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return fallback
    return parsed
      .filter((x): x is SocialLinkItem => !!x && typeof x.url === "string" && x.url.trim() !== "")
      .map((x) => ({
        platform: String(x.platform || "").toLowerCase(),
        label: x.label || platformLabel(String(x.platform || "")),
        url: x.url,
      }))
  } catch {
    return fallback
  }
}
