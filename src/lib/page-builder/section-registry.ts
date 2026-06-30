// ═══════════════════════════════════════════════════════════
// FlixFlex — Page Builder Section Registry
// ═══════════════════════════════════════════════════════════

import {
  Rocket,
  BarChart3,
  Briefcase,
  Grid2X2,
  MessageSquare,
  Zap,
  AlignLeft,
  Image,
  Video,
  HelpCircle,
  Users,
  Mail,
  BookOpen,
  Star,
  List,
  Layout,
  Newspaper,
  Phone,
  BetweenVerticalEnd,
  PhoneCall,
  Sparkles,
  Expand,
  type LucideIcon,
} from "@/lib/icons"
import type { SectionType } from "@/types/page-builder"
import {
  heroPropsSchema,
  heroAnimatedVideoPropsSchema,
  statsPropsSchema,
  servicesPropsSchema,
  servicesShowcasePropsSchema,
  portfolioPropsSchema,
  testimonialsPropsSchema,
  ctaPropsSchema,
  textContentPropsSchema,
  imageTextPropsSchema,
  videoEmbedPropsSchema,
  faqPropsSchema,
  teamPropsSchema,
  contactFormPropsSchema,
  parallaxPropsSchema,
  portfolioVerticalScrollPropsSchema,
  appointmentCardPropsSchema,
  poemAnimationPropsSchema,
  wovenLightHeroPropsSchema,
  scrollExpandMediaPropsSchema,
  modernManifestoPropsSchema,
} from "@/types/page-builder"

// ── Category Labels ───────────────────────────────
export const SECTION_CATEGORIES = [
  "Hero & Banner",
  "İçerik",
  "Portföy & Medya",
  "Sosyal Kanıt",
  "Dönüşüm",
] as const

export type SectionCategory = (typeof SECTION_CATEGORIES)[number]

// ── Section Meta ──────────────────────────────────
export interface SectionMeta {
  type: SectionType
  label: string
  category: SectionCategory
  icon: LucideIcon
  defaultProps: Record<string, unknown>
  /** Tailwind bg color for thumbnail preview */
  thumbnailColor?: string
  description: string
}

// ── Registry ──────────────────────────────────────
export const SECTION_REGISTRY: Record<string, SectionMeta> = {
  "hero": {
    type: "hero",
    label: "Hero Banner",
    category: "Hero & Banner",
    icon: Rocket,
    defaultProps: heroPropsSchema.parse({}),
    description: "Ana sayfa hero bölümü — büyük başlık ve CTA",
  },
  "hero-animated-video": {
    type: "hero-animated-video",
    label: "Video Hero",
    category: "Hero & Banner",
    icon: Video,
    defaultProps: heroAnimatedVideoPropsSchema.parse({}),
    description: "Scroll ile clipPath değişen sinematik video hero",
  },
  "stats": {
    type: "stats",
    label: "İstatistikler",
    category: "İçerik",
    icon: BarChart3,
    defaultProps: statsPropsSchema.parse({}),
    description: "Sayısal veriler ve metrikler",
  },
  "services": {
    type: "services",
    label: "Hizmetler",
    category: "İçerik",
    icon: Briefcase,
    defaultProps: servicesPropsSchema.parse({}),
    description: "Sunulan hizmetlerin listesi",
  },
  "services-showcase": {
    type: "services-showcase",
    label: "Hizmet Vitrini",
    category: "İçerik",
    icon: Briefcase,
    defaultProps: servicesShowcasePropsSchema.parse({}),
    description: "Ana hizmetleri modern bento ızgarada sergiler (alt hizmetler dahil)",
  },
  "portfolio": {
    type: "portfolio",
    label: "Portfolyo",
    category: "Portföy & Medya",
    icon: Grid2X2,
    defaultProps: portfolioPropsSchema.parse({}),
    description: "Proje galerisi ve filtre",
  },
  "parallax": {
    type: "parallax",
    label: "Parallax Scroll",
    category: "Portföy & Medya",
    icon: Image,
    defaultProps: parallaxPropsSchema.parse({}),
    description: "Çok katmanlı parallax — farklı hızlarda kayan görseller",
  },
  "testimonials": {
    type: "testimonials",
    label: "Referanslar",
    category: "Sosyal Kanıt",
    icon: MessageSquare,
    defaultProps: testimonialsPropsSchema.parse({}),
    description: "Müşteri görüşleri ve alıntılar",
  },
  "cta": {
    type: "cta",
    label: "CTA Bölümü",
    category: "Dönüşüm",
    icon: Zap,
    defaultProps: ctaPropsSchema.parse({}),
    description: "Eylem çağrısı — iletişim yönlendirmesi",
  },
  "text-content": {
    type: "text-content",
    label: "Metin İçeriği",
    category: "İçerik",
    icon: AlignLeft,
    defaultProps: textContentPropsSchema.parse({}),
    description: "Serbest metin ve başlık",
  },
  "image-text": {
    type: "image-text",
    label: "Görsel + Metin",
    category: "İçerik",
    icon: Image,
    defaultProps: imageTextPropsSchema.parse({}),
    description: "Yan yana görsel ve metin",
  },
  "video-embed": {
    type: "video-embed",
    label: "Video Gömme",
    category: "Portföy & Medya",
    icon: Video,
    defaultProps: videoEmbedPropsSchema.parse({}),
    description: "YouTube / Vimeo embed",
  },
  "faq": {
    type: "faq",
    label: "SSS",
    category: "İçerik",
    icon: HelpCircle,
    defaultProps: faqPropsSchema.parse({}),
    description: "Sık sorulan sorular akordeonu",
  },
  "team": {
    type: "team",
    label: "Ekip",
    category: "Sosyal Kanıt",
    icon: Users,
    defaultProps: teamPropsSchema.parse({}),
    description: "Ekip üyeleri ızgarası",
  },
  "contact-form": {
    type: "contact-form",
    label: "İletişim Formu",
    category: "Dönüşüm",
    icon: Mail,
    defaultProps: contactFormPropsSchema.parse({}),
    description: "İletişim formu ve bilgiler",
  },
  "manifesto": {
    type: "manifesto",
    label: "Manifesto",
    category: "İçerik",
    icon: BookOpen,
    defaultProps: {},
    description: "Manifesto bölümü",
  },
  "story": {
    type: "story",
    label: "Hikaye",
    category: "İçerik",
    icon: AlignLeft,
    defaultProps: {},
    description: "Hikaye bölümü",
  },
  "values": {
    type: "values",
    label: "Değerler",
    category: "İçerik",
    icon: Star,
    defaultProps: {},
    description: "Değerler bölümü",
  },
  "why-us": {
    type: "why-us",
    label: "Neden Biz",
    category: "Sosyal Kanıt",
    icon: Zap,
    defaultProps: {},
    description: "Neden biz bölümü",
  },
  "services-list": {
    type: "services-list",
    label: "Hizmet Listesi",
    category: "İçerik",
    icon: List,
    defaultProps: {},
    description: "Hizmet listesi bölümü",
  },
  "portfolio-hero": {
    type: "portfolio-hero",
    label: "Portfolyo Hero",
    category: "Hero & Banner",
    icon: Layout,
    defaultProps: {},
    description: "Portfolyo sayfası hero bölümü",
  },
  "portfolio-grid": {
    type: "portfolio-grid",
    label: "Portfolyo Izgarası",
    category: "Portföy & Medya",
    icon: Grid2X2,
    defaultProps: {},
    description: "Portfolyo proje ızgarası",
  },
  "blog-hero": {
    type: "blog-hero",
    label: "Blog Hero",
    category: "Hero & Banner",
    icon: Newspaper,
    defaultProps: {},
    description: "Blog sayfası hero bölümü",
  },
  "blog-grid": {
    type: "blog-grid",
    label: "Blog Izgarası",
    category: "İçerik",
    icon: Newspaper,
    defaultProps: {},
    description: "Blog yazıları ızgarası",
  },
  "contact-hero": {
    type: "contact-hero",
    label: "İletişim Hero",
    category: "Hero & Banner",
    icon: Phone,
    defaultProps: {},
    description: "İletişim sayfası hero bölümü",
  },
  "contact-info": {
    type: "contact-info",
    label: "İletişim Bilgileri",
    category: "Dönüşüm",
    icon: Phone,
    defaultProps: {},
    description: "İletişim bilgileri bölümü",
  },
  "portfolio-radial-gallery": {
    type: "portfolio-radial-gallery",
    label: "Radial Scroll Gallery",
    category: "Portföy & Medya",
    icon: Grid2X2,
    defaultProps: {},
    description: "Seçili işler radial kaydırma galerisi",
  },
  "portfolio-marquee-gallery": {
    type: "portfolio-marquee-gallery",
    label: "Portfolio Gallery",
    category: "Portföy & Medya",
    icon: Grid2X2,
    defaultProps: {},
    description: "Seçili işler marquee galerisi",
  },
  "portfolio-offer-carousel": {
    type: "portfolio-offer-carousel",
    label: "Offer Carousel",
    category: "Portföy & Medya",
    icon: Grid2X2,
    defaultProps: {},
    description: "Fırsatlar carousel gösterimi",
  },
  "portfolio-project-showcase": {
    type: "portfolio-project-showcase",
    label: "Project Showcase",
    category: "Portföy & Medya",
    icon: Grid2X2,
    defaultProps: {},
    description: "Proje showcase görünümü",
  },
  "portfolio-vertical-scroll": {
    type: "portfolio-vertical-scroll",
    label: "Yatay Portfolyo",
    category: "Portföy & Medya",
    icon: BetweenVerticalEnd,
    defaultProps: portfolioVerticalScrollPropsSchema.parse({}),
    description: "Sonsuz döngü marquee dikey portfolyo kartları",
  },
  "appointment-card": {
    type: "appointment-card",
    label: "Randevu Kartı",
    category: "Dönüşüm",
    icon: PhoneCall,
    defaultProps: appointmentCardPropsSchema.parse({}),
    description: "Ön görüşme randevusu alma popup'ını açan kart",
  },
  "poem-animation": {
    type: "poem-animation",
    label: "3D Şiir Hero",
    category: "Hero & Banner",
    icon: Rocket,
    defaultProps: poemAnimationPropsSchema.parse({}),
    description: "3D dönen şiir küpü ve arkaplan görselleri içeren animasyonlu hero bölümü",
  },
  "woven-light-hero": {
    type: "woven-light-hero",
    label: "3D Woven Light Hero",
    category: "Hero & Banner",
    icon: Sparkles,
    defaultProps: wovenLightHeroPropsSchema.parse({}),
    description: "Three.js ile yapılmış etkileşimli 3D ışık örgüsü ve Framer Motion başlığı içeren hero bölümü",
  },
  "scroll-expansion-hero": {
    type: "scroll-expansion-hero",
    label: "Scroll Expansion Hero",
    category: "Hero & Banner",
    icon: Expand,
    defaultProps: scrollExpandMediaPropsSchema.parse({}),
    description: "Scroll ettikçe genişleyen video veya görsel içeren dinamik ve interaktif hero bölümü",
  },
  "modern-manifesto": {
    type: "modern-manifesto",
    label: "Modern Manifesto",
    category: "İçerik",
    icon: Sparkles,
    defaultProps: modernManifestoPropsSchema.parse({}),
    description: "Büyük yazı tipleriyle bütünleşik video veya resim pill'leri içeren manifesto bölümü",
  },
}

// ── Grouped by Category ───────────────────────────
export function getSectionsByCategory(): Record<SectionCategory, SectionMeta[]> {
  const result = {} as Record<SectionCategory, SectionMeta[]>
  for (const cat of SECTION_CATEGORIES) {
    result[cat] = []
  }
  for (const meta of Object.values(SECTION_REGISTRY)) {
    result[meta.category].push(meta)
  }
  return result
}
