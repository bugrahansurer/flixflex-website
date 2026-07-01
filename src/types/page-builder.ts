// ═══════════════════════════════════════════════════════════
// FlixFlex — Page Builder Types & Zod Schemas
// ═══════════════════════════════════════════════════════════

import { z } from "zod"

// ── Section Type Union ────────────────────────────
export type SectionType =
  | "hero"
  | "hero-video"
  | "stats"
  | "services"
  | "portfolio"
  | "testimonials"
  | "video-testimonials"
  | "cta"
  | "text-content"
  | "image-text"
  | "video-embed"
  | "faq"
  | "team"
  | "contact-form"
  | "manifesto"
  | "story"
  | "values"
  | "why-us"
  | "services-list"
  | "services-showcase"
  | "portfolio-hero"
  | "portfolio-grid"
  | "blog-hero"
  | "blog-grid"
  | "contact-hero"
  | "contact-info"
  | "portfolio-radial-gallery"
  | "portfolio-marquee-gallery"
  | "portfolio-offer-carousel"
  | "portfolio-project-showcase"
  | "portfolio-vertical-scroll"
  | "hero-animated-video"
  | "parallax"
  | "appointment-card"
  | "poem-animation"
  | "woven-light-hero"
  | "scroll-expansion-hero"
  | "modern-manifesto"




// ── Generic Section Block ─────────────────────────
export type SectionTransition = "normal" | "sticky" | "parallax" | "overlap" | "story-scroll"

export interface SectionBlock<T = Record<string, unknown>> {
  id: string
  type: SectionType
  order: number
  visible: boolean
  props: T
  transition?: SectionTransition
  stickyPin?: boolean
  [key: string]: any // Make it JSON compatible
}

// ── Page Data ─────────────────────────────────────
export interface PageData {
  id: string
  slug: string
  title: string
  description?: string
  sections: SectionBlock[]
  status: "draft" | "published"
  updatedAt: string
}

// ── Per-type Prop Schemas ─────────────────────────

export const heroPropsSchema = z.object({
  headline: z.string().default("Güçlü Başlık"),
  subheadline: z.string().default("Açıklayıcı alt başlık metni"),
  ctaLabel: z.string().default("Hemen Başla"),
  ctaHref: z.string().default("/iletisim"),
  secondaryCtaLabel: z.string().default("Portfolyoyu Gör"),
  secondaryCtaHref: z.string().default("/portfolio"),
  backgroundVariant: z.enum(["dark", "light", "gradient"]).default("dark"),
})

export const heroVideoPropsSchema = z.object({
  headline: z.string().default("Sinematik Başlık"),
  subheadline: z.string().default("Markanızı videoyla anlatın"),
  videoUrl: z.string().default("/hero-background.mp4"),
  videoUrlMobile: z.string().default(""),
  posterUrl: z.string().default(""),
  ctaLabel: z.string().default("Projeyi Başlat"),
  ctaHref: z.string().default("/iletisim"),
  secondaryCtaLabel: z.string().default("Showreel İzle"),
  secondaryCtaHref: z.string().default("/portfolio"),
  hideMobileDock: z.boolean().default(false),
})

export const statsPropsSchema = z.object({
  headline: z.string().default("Rakamlarla FlixFlex"),
  stats: z.array(z.object({
    value: z.string().default("100+"),
    label: z.string().default("Proje"),
  })).default([
    { value: "150+", label: "Müşteri" },
    { value: "5 Yıl", label: "Deneyim" },
    { value: "%98", label: "Memnuniyet" },
  ]),
  hideMobileDock: z.boolean().default(false),
})

export const servicesPropsSchema = z.object({
  headline: z.string().default("Hizmetlerimiz"),
  subheadline: z.string().default("İşletmeniz için kapsamlı dijital çözümler"),
  showAll: z.boolean().default(false),
  hideMobileDock: z.boolean().default(false),
  services: z
    .array(
      z.object({
        id: z.string().optional(),
        slug: z.string(),
        title: z.string(),
        description: z.string(),
        iconKey: z.string().optional(),
        features: z.array(z.string()).default([]),
        parentId: z.string().nullable().optional(),
        children: z.array(z.unknown()).optional(),
      }),
    )
    .optional(),
})

export const servicesShowcasePropsSchema = z.object({
  headline: z.string().default("Markanı büyüten hizmetler"),
  subheadline: z
    .string()
    .default("Strateji, yaratıcılık ve teknolojiyi tek çatı altında topluyoruz. İhtiyacın olan her şey, bir arada."),
  ctaLabel: z.string().default(""),
  ctaHref: z.string().default(""),
})

export const portfolioPropsSchema = z.object({
  headline: z.string().default("Portfolyo"),
  subheadline: z.string().default("Seçkin projelerimiz"),
  filterEnabled: z.boolean().default(true),
  maxItems: z.number().int().default(6),
  hideMobileDock: z.boolean().default(false),
})

export const portfolioVerticalScrollPropsSchema = z.object({
  headline: z.string().default("Seçili İşlerimiz"),
  subheadline: z.string().default("Akıcı ve dikey formatta projelerimiz"),
  speed: z.enum(["slow", "normal", "fast"]).default("normal"),
  direction: z.enum(["left", "right"]).default("right"),
  pauseOnHover: z.boolean().default(true),
  maxItems: z.number().int().default(12),
  hideMobileDock: z.boolean().default(false),
})

export const testimonialsPropsSchema = z.object({
  headline: z.string().default("Müşterilerimiz Ne Diyor?"),
  subheadline: z.string().default("Birlikte başardıklarımız"),
  hideMobileDock: z.boolean().default(false),
})

export const videoTestimonialsPropsSchema = z.object({
  eyebrow: z.string().default("Video Referanslar"),
  headline: z.string().default("Müşterilerimiz Anlatıyor"),
  subheadline: z.string().default("Birlikte büyüdüğümüz markalar, deneyimlerini kendi sözleriyle paylaşıyor."),
  items: z.array(z.object({
    videoUrl: z.string().default(""),
    posterUrl: z.string().default(""),
    name: z.string().default("İsim Soyisim"),
    role: z.string().default("Görev"),
    company: z.string().default("Marka"),
  })).default([
    { videoUrl: "", posterUrl: "", name: "Elif Şahin", role: "CMO", company: "Novatek" },
    { videoUrl: "", posterUrl: "", name: "Mert Yıldırım", role: "Kurucu", company: "Orbitly" },
    { videoUrl: "", posterUrl: "", name: "Selin Koç", role: "Marka Müdürü", company: "Lümen" },
  ]),
  hideMobileDock: z.boolean().default(false),
})
export type VideoTestimonialsProps = z.infer<typeof videoTestimonialsPropsSchema>

export const ctaPropsSchema = z.object({
  eyebrow: z.string().default("— Bir Sonraki Adım —"),
  headline: z.string().default("Birlikte büyüyelim mi?"),
  description: z.string().default("Brief'ini paylaş, hemen toplanalım."),
  primaryCtaLabel: z.string().default("İletişime Geç"),
  primaryCtaHref: z.string().default("/iletisim"),
  secondaryCtaLabel: z.string().default("Portfolyoyu Gör"),
  secondaryCtaHref: z.string().default("/portfolio"),
  variant: z.enum(["dark", "light"]).default("dark"),
  hideMobileDock: z.boolean().default(false),
})

export const textContentPropsSchema = z.object({
  headline: z.string().default("Başlık"),
  body: z.string().default("İçerik metni buraya gelecek."),
  alignment: z.enum(["left", "center", "right"]).default("left"),
  maxWidthProse: z.boolean().default(true),
  hideMobileDock: z.boolean().default(false),
})

export const imageTextPropsSchema = z.object({
  headline: z.string().default("Görsel ile Metin"),
  body: z.string().default("Açıklama metni."),
  imageUrl: z.string().default(""),
  imageAlt: z.string().default("Görsel"),
  imagePosition: z.enum(["left", "right"]).default("right"),
  ctaLabel: z.string().default(""),
  ctaHref: z.string().default(""),
  hideMobileDock: z.boolean().default(false),
})

export const videoEmbedPropsSchema = z.object({
  headline: z.string().default("Video"),
  videoUrl: z.string().default("https://www.youtube.com/embed/dQw4w9WgXcQ"),
  aspectRatio: z.enum(["16/9", "4/3", "1/1"]).default("16/9"),
  autoplay: z.boolean().default(false),
  hideMobileDock: z.boolean().default(false),
})

export const faqPropsSchema = z.object({
  headline: z.string().default("Sık Sorulan Sorular"),
  subheadline: z.string().default(""),
  items: z.array(z.object({
    question: z.string().default("Soru?"),
    answer: z.string().default("Cevap."),
  })).default([
    { question: "FlixFlex ile nasıl çalışabilirim?", answer: "Bize ulaşarak brief paylaşabilirsiniz." },
    { question: "Proje süresi ne kadar?", answer: "Projeye göre değişir, ortalama 4-8 hafta." },
  ]),
  hideMobileDock: z.boolean().default(false),
})

export const teamPropsSchema = z.object({
  eyebrow: z.string().default("Ekibimiz"),
  headline: z.string().default("Arkamızda insanlar var."),
  subheadline: z.string().default("Strateji, yaratıcılık, veri ve üretim — hepsi tek bir kompakt, güçlü ekipte birleşiyor."),
  members: z.array(z.object({
    name: z.string().default("İsim Soyisim"),
    role: z.string().default("Görev"),
    initials: z.string().default("İS"),
    accent: z.boolean().optional(),
    bio: z.string().optional(),
  })).optional(),
  hideMobileDock: z.boolean().default(false),
})

// ── About: Why-Us (comparison) ──
export const whyUsPropsSchema = z.object({
  eyebrow: z.string().default("Neden FlixFlex"),
  headline: z.string().default("Diğerleri vs. Biz"),
  subheadline: z.string().default("Piyasadaki ajanslardan nasıl ayrışıyoruz? Şeffaf, direkt ve ölçülebilir bir karşılaştırma."),
  items: z.array(z.object({
    topic: z.string().default("Konu"),
    theirs: z.string().default("Onların yaklaşımı"),
    ours: z.string().default("Bizim yaklaşımımız"),
  })).optional(),
  hideMobileDock: z.boolean().default(false),
})

// ── About: Manifesto (minimalist kinetik ifade) ──
export const manifestoPropsSchema = z.object({
  eyebrow: z.string().default("Manifestomuz"),
  headline: z.string().default("Markaları domine eden fikirler üretiriz."),
  highlight: z.string().default("domine"),
  description: z.string().default("Strateji, yaratıcılık ve teknolojiyi tek vuruşta birleştirir; markanı bir sonraki bölüme taşırız."),
  keywords: z.array(z.string()).default(["Hız", "Güç", "Esneklik"]),
  hideMobileDock: z.boolean().default(false),
})

// ── About: Story ──
export const storyPropsSchema = z.object({
  eyebrow: z.string().default("Hikâyemiz"),
  headline: z.string().default("Küçük bir ekip, büyük bir vizyon."),
  paragraphs: z.array(z.string()).optional(),
  hideMobileDock: z.boolean().default(false),
})

// ── About: Values ──
export const valuesPropsSchema = z.object({
  eyebrow: z.string().default("Temel Değerlerimiz"),
  headline: z.string().default("İşimizin DNA'sı bu."),
  subheadline: z.string().default("Her kararımızı, her çalışmamızı ve her müşteri ilişkimizi şekillendiren dört temel değer."),
  items: z.array(z.object({
    iconKey: z.string().default("Star"),
    titleTr: z.string().default("Değer"),
    tagline: z.string().default("Kısa slogan."),
    description: z.string().default("Açıklama metni."),
  })).optional(),
  hideMobileDock: z.boolean().default(false),
})

export const contactFormPropsSchema = z.object({
  headline: z.string().default("İletişime Geç"),
  subheadline: z.string().default("Hemen konuşalım"),
  showMap: z.boolean().default(false),
  primaryColor: z.string().default("var(--ff-purple)"),
  hideMobileDock: z.boolean().default(false),
})

export const heroAnimatedVideoPropsSchema = z.object({
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  videoSrc: z.string().optional(),
  videoSrcMobile: z.string().optional(),
  clipPathVariant: z.enum(["inset", "circle", "none"]).optional(),
  hideMobileDock: z.boolean().default(false),
})

export const parallaxPropsSchema = z.object({
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  layers: z
    .array(
      z.object({
        imageUrl: z.string(),
        speed: z.number().min(0).max(3),
      }),
    )
    .optional(),
})

export const appointmentCardPropsSchema = z.object({
  eyebrow: z.string().default("Hızlı Randevu"),
  headline: z.string().default("Ön Görüşme Randevusu Alın"),
  description: z.string().default("Projelerinizi, hedeflerinizi ve nasıl yardımcı olabileceğimizi konuşmak üzere hemen ücretsiz bir ön görüşme randevusu oluşturun."),
  ctaLabel: z.string().default("Randevu Al"),
  hideMobileDock: z.boolean().default(false),
})

export const poemAnimationPropsSchema = z.object({
  poemHTML: z.string().default(`
    <p>The <span>love</span> between Ayla and Leo ignited in the old courtyard, each morning their swords clashed under dawn’s glow, faces streaked with <span>dust</span> and sweat; they <span>danced</span> between parries, every laugh a spark of joy against uncertain hearts. She stepped forward with <span>courage</span>, he met her gaze with open warmth, two souls seeking a shared <span>triumph</span> in their vulnerability. When blades slipped and one <span>faltered</span>, the other caught them—forearms brushing, pulses aligned in a daring heartbeat. In failure they found grace; in triumph they discovered unity. Each moment spent <span>daring</span> to trust the other built a bond impervious to fear. At dusk, they sheathed their swords, stepping from the <span>arena</span> hand in hand, knowing love blooms not through perfection, but by <span>daring greatly</span> together.</p>
  `),
  backgroundImageUrl: z.string().default("https://i.ibb.co/q3XSxR9W/20250831-120144.jpg"),
  boyImageUrl: z.string().default("https://i.ibb.co/Y4FKvK38/20250831-113022.png"),
  hideMobileDock: z.boolean().default(false),
})

export type PoemAnimationProps = z.infer<typeof poemAnimationPropsSchema>

export const wovenLightHeroPropsSchema = z.object({
  headline: z.string().default("Woven by Light"),
  subheadline: z.string().default("An interactive tapestry of light and motion, crafted with code and creativity."),
  ctaLabel: z.string().default("Explore the Weave"),
  ctaHref: z.string().default("/explore"),
})

export type WovenLightHeroProps = z.infer<typeof wovenLightHeroPropsSchema>

export const scrollExpandMediaPropsSchema = z.object({
  mediaType: z.enum(["video", "image"]).default("video"),
  mediaSrc: z.string().default("https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYuZ5R8ahEEZ4aQK56LizRdfBSqeDMsmUIrJN1"),
  posterSrc: z.string().default("https://images.pexels.com/videos/5752729/space-earth-universe-cosmos-5752729.jpeg"),
  bgImageSrc: z.string().default("https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYMNjMlBUYHaeYpxduXPVNwf8mnFA61L7rkcoS"),
  title: z.string().default("Immersive Video Experience"),
  date: z.string().default("Cosmic Journey"),
  scrollToExpand: z.string().default("Scroll to Expand Demo"),
  textBlend: z.boolean().default(true),
  description: z.string().default("This is a demonstration of the ScrollExpandMedia component. As you scroll, the media expands to fill more of the screen, creating an immersive experience."),
})

export type ScrollExpandMediaProps = z.infer<typeof scrollExpandMediaPropsSchema>

export const modernManifestoPropsSchema = z.object({
  leftText: z.string().default("WE ARE [media1] FLIXFLEX WE [media2] DO BIG [media3] THINGS"),
  mediaUrl1: z.string().default("https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-light-looking-at-camera-34293-large.mp4"),
  mediaType1: z.enum(["video", "image"]).default("video"),
  mediaUrl2: z.string().default("https://assets.mixkit.co/videos/preview/mixkit-hands-holding-and-using-smartphone-40742-large.mp4"),
  mediaType2: z.enum(["video", "image"]).default("video"),
  mediaUrl3: z.string().default("https://assets.mixkit.co/videos/preview/mixkit-waves-breaking-in-the-ocean-1527-large.mp4"),
  mediaType3: z.enum(["video", "image"]).default("video"),
  rightContent: z.string().default("<p>We solve big problems with strategy and creative that make a big impact.</p><p>We work with brands and marketers that have the biggest ambitions.</p><p>We hire big talent and bring them big opportunities that build boundless careers.</p>"),
  ctaLabel: z.string().default("Birlikte Çalışalım"),
  ctaHref: z.string().default("/iletisim"),
  // Colors are intentionally NOT configurable — the section always uses the
  // active theme (bg → --background, text → --foreground, accent → --ff-purple).
  hideMobileDock: z.boolean().default(false),
})

export type ModernManifestoProps = z.infer<typeof modernManifestoPropsSchema>





// ── Section Prop Type Inference ───────────────────
export type HeroProps = z.infer<typeof heroPropsSchema>
export type HeroVideoProps = z.infer<typeof heroVideoPropsSchema>
export type StatsProps = z.infer<typeof statsPropsSchema>
export type ServicesProps = z.infer<typeof servicesPropsSchema>
export type PortfolioProps = z.infer<typeof portfolioPropsSchema>
export type TestimonialsProps = z.infer<typeof testimonialsPropsSchema>
export type CTAProps = z.infer<typeof ctaPropsSchema>
export type TextContentProps = z.infer<typeof textContentPropsSchema>
export type ImageTextProps = z.infer<typeof imageTextPropsSchema>
export type VideoEmbedProps = z.infer<typeof videoEmbedPropsSchema>
export type FAQProps = z.infer<typeof faqPropsSchema>
export type TeamProps = z.infer<typeof teamPropsSchema>
export type ContactFormProps = z.infer<typeof contactFormPropsSchema>
export type PortfolioVerticalScrollProps = z.infer<typeof portfolioVerticalScrollPropsSchema>

// ── Schema Registry ───────────────────────────────
export const SECTION_SCHEMAS: Record<SectionType, z.ZodObject<z.ZodRawShape>> = {
  "hero": heroPropsSchema,
  "hero-video": heroVideoPropsSchema,
  "stats": statsPropsSchema,
  "services": servicesPropsSchema,
  "portfolio": portfolioPropsSchema,
  "testimonials": testimonialsPropsSchema,
  "video-testimonials": videoTestimonialsPropsSchema,
  "cta": ctaPropsSchema,
  "text-content": textContentPropsSchema,
  "image-text": imageTextPropsSchema,
  "video-embed": videoEmbedPropsSchema,
  "faq": faqPropsSchema,
  "team": teamPropsSchema,
  "contact-form": contactFormPropsSchema,
  "manifesto": manifestoPropsSchema,
  "story": storyPropsSchema,
  "values": valuesPropsSchema,
  "why-us": whyUsPropsSchema,
  "services-list": z.object({}),
  "services-showcase": servicesShowcasePropsSchema,
  "portfolio-hero": z.object({}),
  "portfolio-grid": z.object({}),
  "blog-hero": z.object({}),
  "blog-grid": z.object({}),
  "contact-hero": z.object({}),
  "contact-info": z.object({}),
  "portfolio-radial-gallery": z.object({}),
  "portfolio-marquee-gallery": z.object({}),
  "portfolio-offer-carousel": z.object({}),
  "portfolio-project-showcase": z.object({}),
  "hero-animated-video": heroAnimatedVideoPropsSchema,
  "parallax": parallaxPropsSchema,
  "portfolio-vertical-scroll": portfolioVerticalScrollPropsSchema,
  "appointment-card": appointmentCardPropsSchema,
  "poem-animation": poemAnimationPropsSchema,
  "woven-light-hero": wovenLightHeroPropsSchema,
  "scroll-expansion-hero": scrollExpandMediaPropsSchema,
  "modern-manifesto": modernManifestoPropsSchema,
}

