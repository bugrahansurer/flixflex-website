// ═══════════════════════════════════════════════════════════
// FlixFlex — Database Seed
// Çalıştırmak için: npx ts-node prisma/seed.ts
// veya: npm run db:seed
// ═══════════════════════════════════════════════════════════

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { DEFAULT_ROLES, RESOURCES, ACTIONS } from "../src/lib/rbac/resources"

const prisma = new PrismaClient()

// ── Default Super Admin credentials ───────────────
const ADMIN_EMAIL = "admin@flixflex.com"
const ADMIN_PASSWORD =
  process.env.SEED_ADMIN_PASSWORD && process.env.SEED_ADMIN_PASSWORD.length > 0
    ? process.env.SEED_ADMIN_PASSWORD
    : "FlixFlex2026!"

// ── FlixFlex Default Color Palette ────────────────
const FLIXFLEX_DEFAULT_PALETTE = {
  primary:        "#FF4FD8",
  primaryHover:   "#DC2DB6",
  primaryMuted:   "rgba(255, 79, 216, 0.12)",
  secondary:      "#D6FF3B",
  secondaryLight: "#D6FF380D",
  background:     "#F7F7F5",
  surface:        "#FFFFFF",
  foreground:     "#0D0D0D",
  muted:          "#888888",
  border:         "#CCCCCC",
  dark: {
    background: "#0D0D0D",
    surface:    "#1A1A1A",
    foreground: "#F0F0F0",
    muted:      "#888888",
    border:     "#2A2A2A",
  },
  success: "#16a34a",
  warning: "#d97706",
  error:   "#dc2626",
  info:    "#2563eb",
}

// ── Demo Blog Posts ───────────────────────────────
const DEMO_POSTS = [
  {
    title:      "Performance Marketing'de 2025'in 5 Trendi",
    slug:       "performance-marketing-2025-trendleri",
    excerpt:    "Dijital reklamcılık hızla değişiyor. Bu yıl öne çıkan 5 trendi ve markanız için ne anlama geldiğini keşfedin.",
    content:    "# Performance Marketing'de 2025'in 5 Trendi\n\nDijital reklamcılık ekosistemi her geçen yıl köklü değişimler geçiriyor...",
    template:   "editorial",
    category:   "Performance Marketing",
    tags:       ["performance", "dijital", "trend", "2025"],
    readTime:   6,
    status:     "published",
    publishedAt: new Date(),
  },
  {
    title:      "Marka Kimliği: Neden Her Şeyin Temeli?",
    slug:       "marka-kimligi-temel",
    excerpt:    "Güçlü bir marka kimliği olmadan hiçbir kampanya tam anlamıyla çalışmaz. İşte sebebi.",
    content:    "# Marka Kimliği: Neden Her Şeyin Temeli?\n\nMarka kimliği, bir işletmenin görsel ve duygusal parmak izidir...",
    template:   "classic",
    category:   "Marka Stratejisi",
    tags:       ["marka", "kimlik", "strateji"],
    readTime:   5,
    status:     "published",
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    title:      "Creative Brief Yazmanın Sanatı",
    slug:       "creative-brief-yazma-sanati",
    excerpt:    "İyi bir creative brief, kampanyanın yarısıdır. Mükemmel brief'i nasıl yazarsınız?",
    content:    "# Creative Brief Yazmanın Sanatı\n\nBir reklam kampanyasının başarısı, çoğu zaman brief kalitesine bağlıdır...",
    template:   "visual",
    category:   "Creative",
    tags:       ["creative", "brief", "kampanya"],
    readTime:   4,
    status:     "draft",
    publishedAt: null,
  },
]

// ── Demo Portfolio ────────────────────────────────
const DEMO_PORTFOLIO = [
  {
    title:      "Zara Home — Social Media Kampanyası",
    slug:       "zara-home-social-media",
    client:     "Zara Home",
    category:   "Marketing",
    description: "Aylık %340 engagement artışı sağlayan multi-platform sosyal medya stratejisi.",
    coverImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
    images:     [],
    tags:       ["social media", "instagram", "tiktok"],
    serviceSlugs: ["sosyal-medya-yonetimi", "icerik-uretimi"],
    gradient: "from-[#0A0A0A] via-[#1A1A1A] to-[#2A2A2A]",
    accentColor: "#FF4FD8",
    tall: false,
    narrativeParagraphs: [
      "Zara Home için sosyal medya operasyonunu yalnızca içerik üretimi olarak değil, bir büyüme sistemi olarak ele aldık.",
      "Platform bazlı formatları, kampanya ritmini ve topluluk etkileşimini tek bir editoryal sistemde birleştirdik.",
      "Sonuçta marka, sezon kampanyalarında daha yüksek etkileşim ve daha tutarlı bir görsel dil elde etti.",
    ],
    sidebarItems: [
      { heading: "Zorluk", body: "Dağınık içerik akışı ve düşük kampanya etkileşimi." },
      { heading: "Yaklaşım", body: "Aylık takvim, kreatif format sistemi ve performans odaklı yayın ritmi." },
      { heading: "Sonuç", body: "Engagement artışı, yeni takipçi kazanımı ve ölçülebilir ROAS." },
    ],
    resultStats: [
      { value: 340, suffix: "%", label: "Engagement Artışı", description: "Aylık ortalama" },
      { value: 85, suffix: "K", label: "Yeni Takipçi", description: "Kampanya dönemi" },
      { value: 4.2, suffix: "x", label: "ROAS", description: "Çok kanallı kampanya" },
    ],
    results:    [
      { metric: "Engagement Artışı", value: "+340%" },
      { metric: "Yeni Takipçi",      value: "85K" },
      { metric: "ROAS",              value: "4.2x" },
    ],
    year:        2024,
    isPublished: true,
    order:       1,
  },
  {
    title:      "StartupX — Marka Kimliği & Launch",
    slug:       "startupx-marka-kimligi",
    client:     "StartupX",
    category:   "Branding",
    description: "Sıfırdan marka inşası: logo, kimlik, launch kampanyası ve dijital varlık.",
    coverImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
    images:     [],
    tags:       ["branding", "logo", "launch"],
    serviceSlugs: ["marka-kimligi", "yaratici-yonetim"],
    gradient: "from-[#1A0A0A] via-[#3D1A2E] to-[#5C1A3D]",
    accentColor: "#FB7185",
    tall: true,
    narrativeParagraphs: [
      "StartupX lansmanında önce markanın konumunu, tonunu ve görsel karakterini netleştirdik.",
      "Kimlik sistemi logo, renk, tipografi ve lansman kampanyasına kadar bütünleşik tasarlandı.",
      "Lansman günü marka hem satış hem de görünürlük açısından güçlü bir ilk izlenim yarattı.",
    ],
    sidebarItems: [
      { heading: "Zorluk", body: "Sıfırdan marka algısı oluşturmak ve lansmana yetişmek." },
      { heading: "Yaklaşım", body: "Kimlik sistemi, mesaj mimarisi ve launch kreatiflerini paralel ilerletmek." },
      { heading: "Sonuç", body: "Güçlü ilk satış, PR görünürlüğü ve tutarlı marka dili." },
    ],
    resultStats: [
      { value: 500, suffix: "K₺", label: "Launch Günü Satış", description: "İlk gün" },
      { value: 23, suffix: "", label: "Medya Yayını", description: "PR coverage" },
      { value: 50, suffix: "K+", label: "Yeni Takipçi", description: "İlk ay" },
    ],
    results:    [
      { metric: "Launch Günü Satış",  value: "500K₺" },
      { metric: "Medya Coverage",     value: "23 Yayın" },
    ],
    year:        2024,
    isPublished: true,
    order:       2,
  },
]

const DEMO_SERVICES = [
  {
    slug: "performans-pazarlamasi",
    title: "Performance Marketing",
    description: "Veri odaklı kampanyalar, hedeflenmiş erişim ve ölçülebilir büyüme stratejileri.",
    body: "Her reklam lirası geri dönmeli. FlixFlex performans pazarlaması; Google, Meta, TikTok ve programatik kanallar üzerinde A/B testleri, funnel optimizasyonu ve gerçek zamanlı bütçe yönetimiyle ROAS'ınızı maksimize eder.",
    icon: "BarChart3",
    features: ["Google & Meta Ads optimizasyonu", "Gerçek zamanlı ROAS takibi", "A/B test & funnel analizi"],
    processSteps: [
      { title: "Keşif & Hedef", description: "KPI'lar, mevcut hesap yapısı ve büyüme hedefleri netleştirilir." },
      { title: "Kurulum", description: "Kampanya mimarisi, kitleler ve kreatif test matrisi hazırlanır." },
      { title: "Optimizasyon", description: "Haftalık test ve bütçe optimizasyon döngüsü yürütülür." },
    ],
    deliverables: ["Kampanya mimarisi", "Performans dashboard", "Aylık ROAS raporu"],
    isPublished: true,
    order: 1,
  },
  {
    slug: "yaratici-yonetim",
    title: "Creative Direction",
    description: "Görsel kimlik ve yaratıcı strateji — marka sesini netleştiren tasarım dili.",
    body: "FlixFlex yaratıcı yönetimi; markanızın özünden çıkan tutarlı, güçlü ve akılda kalan görsel bir dil oluşturur.",
    icon: "Palette",
    features: ["Marka görsel dil sistemi", "Kampanya konseptleri", "Art direction & storyboard"],
    processSteps: [
      { title: "Araştırma", description: "Marka algısı ve rakip görsel dilleri analiz edilir." },
      { title: "Konsept", description: "Moodboard ve yaratıcı yönler hazırlanır." },
      { title: "Sistem", description: "Seçilen yön tüm kanallara uygulanır." },
    ],
    deliverables: ["Yaratıcı strateji brief", "Moodboard", "Kampanya kreatif seti"],
    isPublished: true,
    order: 2,
  },
  {
    slug: "sosyal-medya-yonetimi",
    title: "Social Media Management",
    description: "İçerik planlaması, topluluk yönetimi ve organik büyüme operasyonları.",
    body: "Sosyal medya bir yayın kanalı değil, topluluk inşa etme zeminidir. İçerik takvimi, yaratıcı üretim ve analitik raporlamayla markanızın sesini güçlendiririz.",
    icon: "MessageSquare",
    features: ["Aylık içerik takvimi", "Görsel ve metin üretimi", "Topluluk yönetimi"],
    processSteps: [
      { title: "Analiz", description: "Platform, hedef kitle ve rakip içerikleri incelenir." },
      { title: "Plan", description: "30 günlük içerik planı hazırlanır." },
      { title: "Yayın", description: "İçerikler yayınlanır ve etkileşim yönetilir." },
    ],
    deliverables: ["Aylık içerik takvimi", "Görsel/kopya seti", "Aylık büyüme raporu"],
    isPublished: true,
    order: 3,
  },
  {
    slug: "marka-kimligi",
    title: "Brand Identity",
    description: "Sıfırdan marka inşası; logo, renk sistemi, yazı ailesi ve ses tonu.",
    body: "Marka kimliği bir logo değil, bir vaattir. Markanızın temelini, kişiliğini, görsel dilini ve iletişim tonunu baştan sona inşa ederiz.",
    icon: "Fingerprint",
    features: ["Logo & marka işareti", "Renk paleti", "Ses tonu rehberi"],
    processSteps: [
      { title: "Strateji", description: "Konumlandırma ve marka değerleri netleştirilir." },
      { title: "Tasarım", description: "Logo, renk ve tipografi sistemi geliştirilir." },
      { title: "Teslim", description: "Marka kılavuzu ve uygulamalar teslim edilir." },
    ],
    deliverables: ["Logo seti", "Renk & tipografi sistemi", "Marka kılavuzu"],
    isPublished: true,
    order: 4,
  },
  {
    slug: "icerik-uretimi",
    title: "Content Production",
    description: "Video, fotoğraf ve motion design ile markanızı görünür kılan içerikler.",
    body: "Ürün fotoğrafçılığından tanıtım filmlerine, motion grafiklerden sosyal medya içeriklerine kadar prodüksiyon süreçlerini yönetiriz.",
    icon: "Clapperboard",
    features: ["Fotoğraf & video", "Motion design", "Sosyal medya formatları"],
    processSteps: [
      { title: "Konsept", description: "Yaratıcı brief ve storyboard hazırlanır." },
      { title: "Prodüksiyon", description: "Çekim veya motion üretim gerçekleştirilir." },
      { title: "Teslim", description: "İçerikler platform formatlarına optimize edilir." },
    ],
    deliverables: ["Düzenlenmiş materyaller", "Platform format setleri", "Kullanım hakları"],
    isPublished: true,
    order: 5,
  },
  {
    slug: "web-ve-dijital",
    title: "Web & Digital",
    description: "Dijital vitrin ve deneyim tasarımı — dönüşüm odaklı modern web çözümleri.",
    body: "UX araştırması, UI tasarımı ve modern geliştirme teknolojileriyle hız, estetik ve dönüşüm odaklı dijital deneyimler inşa ederiz.",
    icon: "Globe",
    features: ["UX araştırması", "UI tasarımı", "Next.js geliştirme"],
    processSteps: [
      { title: "UX", description: "Kullanıcı yolculuğu ve bilgi mimarisi oluşturulur." },
      { title: "Tasarım", description: "Figma'da yüksek kaliteli UI tasarlanır." },
      { title: "Geliştirme", description: "Next.js ile hızlı ve SEO uyumlu site geliştirilir." },
    ],
    deliverables: ["UX raporu", "UI tasarımı", "Next.js kaynak kodu"],
    isPublished: true,
    order: 6,
  },
]

// ── Demo Pages ────────────────────────────────────
const DEMO_PAGES = [
  {
    slug: "anasayfa",
    title: "Ana Sayfa",
    description: "FlixFlex ana sayfası",
    isPublished: true,
    sections: [
      { id: "h1", type: "hero", order: 0, visible: true, props: {} },
      { id: "h2", type: "stats", order: 1, visible: true, props: {} },
      { id: "h3", type: "services", order: 2, visible: true, props: {} },
      {
        id: "h-marquee-scroll",
        type: "portfolio-vertical-scroll",
        order: 3,
        visible: true,
        props: {
          headline: "Domine Ettiğimiz Markalar",
          subheadline: "Stratejik vizyonumuzun ürünü olan dikey formatta projelerimiz.",
          speed: "normal",
          direction: "right",
          pauseOnHover: true,
        },
      },
      { id: "h4", type: "portfolio", order: 4, visible: true, props: {} },
      { id: "h5", type: "testimonials", order: 5, visible: true, props: {} },
      { id: "h6", type: "cta", order: 6, visible: true, props: {} },
    ],
  },
  {
    slug: "hakkimizda",
    title: "Hakkımızda",
    description: "FlixFlex hakkında",
    isPublished: true,
    sections: [
      { id: "a1", type: "manifesto", order: 0, visible: true, props: {} },
      { id: "a2", type: "story", order: 1, visible: true, props: {} },
      { id: "a3", type: "values", order: 2, visible: true, props: {} },
      { id: "a4", type: "team", order: 3, visible: true, props: {} },
      { id: "a5", type: "why-us", order: 4, visible: true, props: {} },
    ],
  },
  {
    slug: "hizmetler",
    title: "Hizmetler",
    description: "FlixFlex hizmetleri",
    isPublished: true,
    sections: [
      { id: "hz1", type: "hero", order: 0, visible: true, props: { headline: "Markanı domine etmek için 6 yol", subheadline: "Strateji, yaratıcılık ve teknoloji — üçünü aynı anda doğru kullanan markalar öne çıkar. İşte biz de tam olarak bunu yapıyoruz." } },
      { id: "hz2", type: "services-list", order: 1, visible: true, props: {} },
      { id: "hz3", type: "cta", order: 2, visible: true, props: {} },
    ],
  },
  {
    slug: "portfolio",
    title: "Portfolyo",
    description: "Seçili işlerimiz",
    isPublished: true,
    sections: [
      { id: "pf1", type: "portfolio-hero", order: 0, visible: true, props: {} },
      { id: "pf2", type: "portfolio-grid", order: 1, visible: true, props: {} },
      { id: "pf3", type: "cta", order: 2, visible: true, props: {} },
    ],
  },
  {
    slug: "blog",
    title: "Blog",
    description: "Düşünceler & İçgörüler",
    isPublished: true,
    sections: [
      { id: "bl1", type: "blog-hero", order: 0, visible: true, props: {} },
      { id: "bl2", type: "blog-grid", order: 1, visible: true, props: {} },
      { id: "bl3", type: "cta", order: 2, visible: true, props: {} },
    ],
  },
  {
    slug: "iletisim",
    title: "İletişim",
    description: "Bize ulaşın",
    isPublished: true,
    sections: [
      { id: "ct1", type: "contact-hero", order: 0, visible: true, props: {} },
      { id: "ct2", type: "contact-info", order: 1, visible: true, props: {} },
      { id: "ct3", type: "why-us", order: 2, visible: true, props: {} },
      { id: "ct4", type: "faq", order: 3, visible: true, props: {} },
    ],
  },
  {
    slug: "kariyer",
    title: "Kariyer",
    description: "FlixFlex'te kariyer ve açık pozisyonlar",
    isPublished: true,
    sections: [
      {
        id: "kar1",
        type: "text-content",
        order: 0,
        visible: true,
        props: {
          headline: "Bizimle Çalışın",
          body: "<p class='mb-6 text-lg text-[var(--foreground-muted)]'>FlixFlex olarak hız, güç ve esnekliğe inanan kreatif yeteneklerle çalışmak istiyoruz. Eğer siz de dijital dünyayı domine etmek istiyorsanız bizimle iletişime geçin.</p><h3 class='text-2xl font-bold mt-12 mb-6 text-[var(--foreground)]'>Açık Pozisyonlar</h3><ul class='list-disc pl-6 space-y-3 text-[var(--foreground-muted)]'><li>Senior React Developer (Remote)</li><li>Performance Marketing Specialist</li><li>Art Director</li></ul><p class='mt-10'>Başvurularınız için özgeçmişinizi <a href='mailto:hello@flixflex.com' class='text-[var(--ff-purple)] hover:underline'>hello@flixflex.com</a> adresine gönderebilirsiniz.</p>",
          alignment: "left",
          maxWidthProse: true,
        },
      },
    ],
  },
  {
    slug: "gizlilik-politikasi",
    title: "Gizlilik Politikası",
    description: "Gizlilik politikamız ve veri güvenliği",
    isPublished: true,
    sections: [
      {
        id: "gp1",
        type: "text-content",
        order: 0,
        visible: true,
        props: {
          headline: "Gizlilik Politikası",
          body: "<p class='mb-6 text-lg text-[var(--foreground-muted)]'>FlixFlex olarak kişisel verilerinizin güvenliği hususuna azami hassasiyet göstermekteyiz. Bu bilinçle, ajans olarak hizmetlerimizden faydalanan kişilere ait her türlü kişisel verilerin 6698 sayılı Kişisel Verilerin Korunması Kanunu'na uygun olarak işlenmesine ve muhafaza edilmesine önem veriyoruz.</p><p class='mb-4 text-[var(--foreground-muted)]'>Kişisel verileriniz, ajansımız tarafından sunulan ürün ve hizmetlerin geliştirilmesi, müşteri ilişkilerinin yönetilmesi ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmektedir.</p>",
          alignment: "left",
          maxWidthProse: true,
        },
      },
    ],
  },
  {
    slug: "kullanim-sartlari",
    title: "Kullanım Şartları",
    description: "Kullanım şartları ve kurallar",
    isPublished: true,
    sections: [
      {
        id: "ks1",
        type: "text-content",
        order: 0,
        visible: true,
        props: {
          headline: "Kullanım Şartları",
          body: "<p class='mb-6 text-lg text-[var(--foreground-muted)]'>FlixFlex web sitesine erişiminiz veya siteyi kullanımınız, bu kullanım şartlarını kabul ettiğiniz anlamına gelir. Bu şartları kabul etmiyorsanız lütfen siteyi kullanmayınız.</p><p class='mb-4 text-[var(--foreground-muted)]'>Bu web sitesinde yer alan tüm görsel, yazılı ve dijital içeriklerin telif hakları FlixFlex'e aittir. İzinsiz kopyalanması veya kullanılması yasaktır.</p>",
          alignment: "left",
          maxWidthProse: true,
        },
      },
    ],
  },
  {
    slug: "cerez-politikasi",
    title: "Çerez Politikası",
    description: "Çerez politikası ve tercihleriniz",
    isPublished: true,
    sections: [
      {
        id: "cp1",
        type: "text-content",
        order: 0,
        visible: true,
        props: {
          headline: "Çerez Politikası",
          body: "<p class='mb-6 text-lg text-[var(--foreground-muted)]'>Web sitemizde, kullanıcı deneyiminizi geliştirmek ve site trafiğini analiz etmek amacıyla çerezler kullanılmaktadır. Sitemizi ziyaret ederek çerez kullanımını kabul etmiş olursunuz.</p><p class='mb-4 text-[var(--foreground-muted)]'>Çerezler, tarayıcınız tarafından bilgisayarınıza veya mobil cihazınıza kaydedilen küçük veri dosyalarıdır. Çerez tercihlerinizi tarayıcı ayarlarınızdan değiştirebilirsiniz.</p>",
          alignment: "left",
          maxWidthProse: true,
        },
      },
    ],
  },
  {
    slug: "kvkk-aydinlatma-metni",
    title: "KVKK Aydınlatma Metni",
    description: "Kişisel verilerin korunması aydınlatma metni",
    isPublished: true,
    sections: [
      {
        id: "kvkk1",
        type: "text-content",
        order: 0,
        visible: true,
        props: {
          headline: "KVKK Aydınlatma Metni",
          body: "<p class='mb-6 text-lg text-[var(--foreground-muted)]'>Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca, FlixFlex tarafından kişisel verilerinizin işlenme amaçları, hukuki sebepleri ve haklarınız konusunda sizi bilgilendirmek amacıyla hazırlanmıştır.</p><p class='mb-4 text-[var(--foreground-muted)]'>Veri sahibi olarak Kanun'un 11. maddesinde belirtilen haklarınızı kullanmak için ajansımızla her zaman iletişime geçebilirsiniz.</p>",
          alignment: "left",
          maxWidthProse: true,
        },
      },
    ],
  },
]

// ── Site Settings ─────────────────────────────────
const SITE_SETTINGS = [
  { key: "site_name",             value: "FlixFlex",                                type: "string" },
  { key: "site_tagline",          value: "Next-Gen Reklam Ajansı",                  type: "string" },
  { key: "site_email",            value: "merhaba@flixflex.com",                    type: "string" },
  { key: "site_phone",            value: "+90 212 000 00 00",                       type: "string" },
  { key: "site_logo",             value: "",                                        type: "string" },
  { key: "site_favicon",          value: "",                                        type: "string" },
  { key: "site_meta_title",       value: "FlixFlex — Next-Gen Marketing Agency",    type: "string" },
  { key: "site_meta_description", value: "Modern ve performans odaklı pazarlama çözümleri.", type: "string" },
  { key: "social_instagram",      value: "https://instagram.com/flixflex",          type: "string" },
  { key: "social_linkedin",       value: "https://linkedin.com/company/flixflex",   type: "string" },
]

// ── Wildcard permission set for Super Admin ───────
// Builds the cartesian product of every known resource × action
// so the Super Admin role can do anything. This stays in lockstep
// with src/lib/rbac/resources.ts — adding a new resource/action
// there automatically grows this set on next seed.
function buildSuperAdminPermissions() {
  const resources = Object.values(RESOURCES)
  const actions   = Object.values(ACTIONS)
  return resources.flatMap((resource) =>
    actions.map((action) => ({ resource, action }))
  )
}

async function main() {
  console.log("🌱 FlixFlex seed başlıyor...\n")

  // ── 1. Rolleri oluştur (idempotent) ───────────
  console.log("📋 Roller oluşturuluyor...")
  const createdRoles: Record<string, string> = {}

  for (const roleDef of DEFAULT_ROLES) {
    // Super Admin gets a generated wildcard permission set
    // covering every resource × action (matches '*:*' intent).
    const permissions =
      roleDef.name === "Super Admin"
        ? buildSuperAdminPermissions()
        : roleDef.permissions

    // Upsert role
    const role = await prisma.role.upsert({
      where:  { name: roleDef.name },
      update: {
        description: roleDef.description,
        isSystem:    roleDef.isSystem,
      },
      create: {
        name:        roleDef.name,
        description: roleDef.description,
        isSystem:    roleDef.isSystem,
      },
    })

    // Reconcile permissions: only add missing permissions to avoid wiping out
    // any custom permissions the user configured in the dashboard.
    if (permissions.length > 0) {
      const existingPerms = await prisma.permission.findMany({ where: { roleId: role.id } })
      const missingPerms = permissions.filter((p) => 
        !existingPerms.some((ep) => ep.resource === p.resource && ep.action === p.action)
      )

      if (missingPerms.length > 0) {
        await prisma.permission.createMany({
          data: missingPerms.map((p) => ({
            roleId:   role.id,
            resource: p.resource,
            action:   p.action,
          })),
          skipDuplicates: true,
        })
      }
    }

    createdRoles[roleDef.name] = role.id
    console.log(`  ✓ ${roleDef.name} (${permissions.length} permissions)`)
  }

  // ── 2. Super Admin kullanıcısı (idempotent) ───
  console.log("\n👤 Super Admin kullanıcısı oluşturuluyor...")
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)

  const adminUser = await prisma.user.upsert({
    where:  { email: ADMIN_EMAIL },
    update: {}, // Preserve custom admin credentials and state
    create: {
      email:    ADMIN_EMAIL,
      name:     "FlixFlex Admin",
      password: passwordHash,
      roleId:   createdRoles["Super Admin"],
      isActive: true,
    },
  })
  console.log(`  ✓ ${adminUser.email}`)

  // ── 3. Default renk paleti ────────────────────
  console.log("\n🎨 FlixFlex default renk paleti oluşturuluyor...")
  await prisma.colorPalette.upsert({
    where:  { id: "default-flixflex" },
    update: {},
    create: {
      id:          "default-flixflex",
      name:        "FlixFlex Default",
      isActive:    true,
      isSystem:    true,
      colors:      FLIXFLEX_DEFAULT_PALETTE,
      fontDisplay: "Syne",
      fontBody:    "DM Sans",
    },
  })
  console.log("  ✓ FlixFlex Default palette")

  // ── 3.1 FlixFlex Modern UI (System) ───────────
  console.log("🎨 FlixFlex Modern UI tema oluşturuluyor...")
  await prisma.colorPalette.upsert({
    where:  { id: "flixflex-modern-ui" },
    update: { isSystem: true },
    create: {
      id:          "flixflex-modern-ui",
      name:        "FlixFlex Modern UI",
      description: "Yepyeni nesil premium tasarım — yuvarlatılmış köşeler, cam efektleri.",
      isActive:    false,
      isSystem:    true,
      colors:      {
        ...FLIXFLEX_DEFAULT_PALETTE,
        primary: "#6C3CE1",
        background: "#000000",
        surface: "#111111",
        border: "#222222",
      },
      settings: {
        buttonShape: "rounded",
        containerShape: "rounded",
        headerVariant: "classic",
      },
      fontDisplay: "Syne",
      fontBody:    "DM Sans",
    },
  })
  console.log("  ✓ FlixFlex Modern UI palette")

  // ── 4. Demo blog postları ─────────────────────
  console.log("\n📝 Demo blog postları oluşturuluyor...")
  for (const post of DEMO_POSTS) {
    await prisma.blogPost.upsert({
      where:  { slug: post.slug },
      update: {},
      create: post,
    })
    console.log(`  ✓ ${post.title}`)
  }

  // ── 5. Demo hizmetler ─────────────────────────
  console.log("\n🧩 Demo hizmetler oluşturuluyor...")
  for (const service of DEMO_SERVICES) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {}, // Preserve custom services modifications
      create: service,
    })
    console.log(`  ✓ ${service.title}`)
  }

  // ── 5.1 Demo portfolio ───────────────────────
  console.log("\n💼 Demo portfolio öğeleri oluşturuluyor...")
  for (const item of DEMO_PORTFOLIO) {
    const { serviceSlugs, ...portfolioData } = item
    await prisma.portfolioItem.upsert({
      where:  { slug: item.slug },
      update: {}, // Preserve custom portfolio items modifications
      create: {
        ...portfolioData,
        services: { connect: serviceSlugs.map((slug) => ({ slug })) },
      },
    })
    console.log(`  ✓ ${item.title}`)
  }

  // ── 6. Demo sayfalar ─────────────────────────
  console.log("\n📄 Demo sayfalar oluşturuluyor...")
  for (const page of DEMO_PAGES) {
    await prisma.page.upsert({
      where:  { slug: page.slug },
      update: {}, // Preserve custom page content if page already exists
      create: page,
    })
    console.log(`  ✓ ${page.title}`)
  }

  // ── 7. Site ayarları ──────────────────────────
  console.log("\n⚙️  Site ayarları oluşturuluyor...")
  for (const setting of SITE_SETTINGS) {
    await prisma.siteSetting.upsert({
      where:  { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log("  ✓ Temel site ayarları")

  // ── Özet ─────────────────────────────────────
  const passwordIsDefault = ADMIN_PASSWORD === "FlixFlex2026!"
  console.log("\n✅ Seed tamamlandı!")
  console.log("═══════════════════════════════════════")
  console.log("  Admin URL:   http://localhost:3000/giris")
  console.log(`  E-posta:     ${ADMIN_EMAIL}`)
  console.log(
    passwordIsDefault
      ? `  Şifre:       ${ADMIN_PASSWORD}  (default — production'da SEED_ADMIN_PASSWORD set edin)`
      : "  Şifre:       (SEED_ADMIN_PASSWORD env'inden okundu)"
  )
  console.log("═══════════════════════════════════════")
  console.log("\nSeeded users:")
  console.log([{ email: adminUser.email, role: "Super Admin", id: adminUser.id }])
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
