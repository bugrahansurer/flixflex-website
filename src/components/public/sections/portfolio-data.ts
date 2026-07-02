// ═══════════════════════════════════════════════════════════
// FlixFlex Portfolio — Static demo data
// ═══════════════════════════════════════════════════════════

export type PortfolioCategory = string

export interface PortfolioItem {
  id?: string
  slug: string
  title: string
  client: string
  clientLogo?: string | null
  year: number
  category: PortfolioCategory
  description: string
  /** Proje sitesi / sosyal medya / ilgili dış bağlantı (opsiyonel). */
  linkUrl?: string | null
  /** Ziyaret butonu metni; boşsa varsayılan "Projeyi Ziyaret Et". */
  linkLabel?: string | null
  coverImage?: string
  images?: string[]
  /** Tailwind gradient classes for the placeholder visual */
  gradient: string
  /** Accent colour for the big project name overlay */
  accentColor: string
  /** Make this card tall in the masonry grid — row-span-2 */
  tall?: boolean
  narrativeParagraphs?: string[]
  sidebarItems?: { heading: string; body: string }[]
  resultStats?: {
    value: number
    suffix?: string
    prefix?: string
    label: string
    description?: string
  }[]
  serviceSlugs?: string[]
}

export const PORTFOLIO_CATEGORIES: { label: string; value: PortfolioCategory | "all" }[] = [
  { label: "Tümü", value: "all" },
  { label: "Branding", value: "Branding" },
  { label: "Performance", value: "Performance" },
  { label: "Web", value: "Web" },
  { label: "Content", value: "Content" },
]

export const PORTFOLIO: PortfolioItem[] = [
  {
    slug: "lumino-brand-identity",
    title: "Marka Kimliği Yenileme",
    client: "Lumino Gıda",
    year: 2024,
    category: "Branding",
    description:
      "B2B gıda markasının kurumsal kimliğini sıfırdan inşa ettik. Logo, renk paleti, tipografi sistemi ve marka rehberi.",
    gradient: "from-[#1A1A1A] via-[#2A1A3A] to-[#3D1A5C]",
    accentColor: "var(--ff-purple)",
    tall: true,
  },
  {
    slug: "nexwave-performance",
    title: "ROAS 9.2x Büyüme",
    client: "NexWave Teknoloji",
    year: 2024,
    category: "Performance",
    description:
      "Meta & Google kampanyalarını yeniden yapılandırarak 90 günde ROAS'ı 2.1x'ten 9.2x'e taşıdık.",
    gradient: "from-[#0D0D1A] via-[#1A1A2E] to-[#16213E]",
    accentColor: "#4FC3F7",
    tall: false,
  },
  {
    slug: "orion-web",
    title: "Kurumsal Web Sitesi",
    client: "Orion Yapı",
    year: 2025,
    category: "Web",
    description:
      "İnşaat şirketi için motion-first, SEO optimize kurumsal web sitesi. Next.js + Framer Motion.",
    gradient: "from-[#111111] via-[#1F2937] to-[#374151]",
    accentColor: "#34D399",
    tall: false,
  },
  {
    slug: "pulse-content-series",
    title: "12 Aylık İçerik Serisi",
    client: "Pulse Fintech",
    year: 2024,
    category: "Content",
    description:
      "LinkedIn & Instagram için aylık 40 içerik — grafik, kısa video ve reel prodüksiyon. 180K organik erişim.",
    gradient: "from-[#0A0A1A] via-[#1A1035] to-[#2D1B69]",
    accentColor: "#F472B6",
    tall: true,
  },
  {
    slug: "zest-brand-launch",
    title: "Sıfırdan Marka Lansmanı",
    client: "Zest Kozmetik",
    year: 2025,
    category: "Branding",
    description:
      "Yeni kozmetik markasının naming, visual identity ve launch kampanyası. İlk ayda 50K takipçi.",
    gradient: "from-[#1A0A0A] via-[#3D1A2E] to-[#5C1A3D]",
    accentColor: "#FB7185",
    tall: false,
  },
  {
    slug: "apex-ecommerce",
    title: "E-ticaret Platformu",
    client: "Apex Spor",
    year: 2025,
    category: "Web",
    description:
      "Yüksek dönüşümlü spor ekipmanları e-ticaret sitesi. Headless commerce mimarisi ile %38 dönüşüm artışı.",
    gradient: "from-[#0D1A0D] via-[#1A2E1A] to-[#14532D]",
    accentColor: "#4ADE80",
    tall: false,
  },
  {
    slug: "nova-performance-funnel",
    title: "Dönüşüm Hunisi",
    client: "Nova Eğitim",
    year: 2024,
    category: "Performance",
    description:
      "Online eğitim platformu için full-funnel strateji. CPA'yı %62 düşürdük, kayıt oranını ikiye katladık.",
    gradient: "from-[#1A1500] via-[#2D2000] to-[#451A03]",
    accentColor: "#FCD34D",
    tall: true,
  },
  {
    slug: "metro-social-ops",
    title: "Sosyal Medya Yönetimi",
    client: "Metro AVM",
    year: 2025,
    category: "Content",
    description:
      "3 AVM için bütünleşik sosyal medya operasyonu. Haftada 21 içerik, kampanya yönetimi ve topluluk moderasyonu.",
    gradient: "from-[#0A0A0A] via-[#1A1A1A] to-[#2A2A2A]",
    accentColor: "var(--ff-purple)",
    tall: false,
  },
]
