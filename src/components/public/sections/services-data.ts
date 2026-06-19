// ═══════════════════════════════════════════════════════════
// FlixFlex — Services Data
// 6 core service entries for ServicesSection + detail pages
// ═══════════════════════════════════════════════════════════

import {
  BarChart3,
  Palette,
  MessageSquare,
  Fingerprint,
  Clapperboard,
  Globe,
  type LucideIcon,
} from "@/lib/icons"

export interface ProcessStep {
  title: string
  description: string
}

export interface SubServiceItem {
  /** Display label */
  label: string
  /** Link target */
  href: string
  /** Lucide icon identifier string */
  iconKey: string
}

export interface Service {
  id?: string
  /** URL segment: /hizmetler/{slug} */
  slug: string
  /** Display title */
  title: string
  /** One-line description shown on card */
  description: string
  /** Extended body paragraph for the detail hero */
  body: string
  /** Lucide icon component */
  icon?: LucideIcon
  /** DB-safe icon identifier */
  iconKey?: string
  /** 3-4 bullet features shown on the list page card */
  features: string[]
  /** 4-5 numbered process steps for the detail page */
  processSteps: ProcessStep[]
  /** Deliverables grid items for the detail page */
  deliverables: string[]
  /** Parent service ID (null = top-level/parent) */
  parentId?: string | null
  /** Sub-services rendered inside the card */
  subServices?: SubServiceItem[]
  /** Nested child services (from DB hierarchy via mapService) */
  children?: Service[]
  relatedPortfolio?: import("./portfolio-data").PortfolioItem[]
  coverImage?: string | null
  accentColor?: string | null
  gradient?: string | null
}

export const SERVICES: Service[] = [
  {
    slug: "performans-pazarlamasi",
    title: "Performance Marketing",
    iconKey: "BarChart3",
    description: "Veri odaklı kampanyalar, hedeflenmiş erişim ve ölçülebilir büyüme stratejileri.",
    body: "Her reklam lirası geri dönmeli. FlixFlex performans pazarlaması; Google, Meta, TikTok ve programatik kanallar üzerinde A/B testleri, funnel optimizasyonu ve gerçek zamanlı bütçe yönetimiyle ROAS'ınızı maksimize eder. Veri sizin için konuşur, biz de onu dinleriz.",
    icon: BarChart3,
    subServices: [
      { label: "Google Ads Yönetimi", href: "/hizmetler/performans-pazarlamasi", iconKey: "Search" },
      { label: "Meta (FB/IG) Reklamları", href: "/hizmetler/performans-pazarlamasi", iconKey: "Target" },
      { label: "TikTok & Video Ads", href: "/hizmetler/performans-pazarlamasi", iconKey: "Film" },
      { label: "Programatik Reklam", href: "/hizmetler/performans-pazarlamasi", iconKey: "LayoutGrid" },
    ],
    features: [
      "Google & Meta Ads optimizasyonu",
      "Gerçek zamanlı ROAS takibi",
      "A/B test & funnel analizi",
      "Retargeting & lookalike segmentler",
    ],
    processSteps: [
      {
        title: "Keşif & Hedef Belirleme",
        description: "Mevcut kampanya performansını, rakip konumlandırmasını ve büyüme hedeflerini netleştiriyoruz. KPI'lar somutlaşır.",
      },
      {
        title: "Kanal Stratejisi & Bütçe Planı",
        description: "Google, Meta, TikTok ve programatik kanallar arasındaki optimum dağılımı veriyle belirliyoruz.",
      },
      {
        title: "Kampanya Kurulum & Yaratıcı Üretim",
        description: "Reklam grupları, hedef kitle segmentleri ve kreatifler oluşturulur; A/B test matrisi hazırlanır.",
      },
      {
        title: "Canlıya Alış & Gerçek Zamanlı İzleme",
        description: "Kampanyalar yayına girer, günlük dashboard üzerinden bütçe ve performans takibi başlar.",
      },
      {
        title: "Optimizasyon & Raporlama",
        description: "Haftalık optimizasyon döngüsü ve aylık kapsamlı performans raporu ile sürekli iyileştirme sağlanır.",
      },
    ],
    deliverables: [
      "Kampanya mimarisi dokümanı",
      "Reklam yaratıcıları (copy + görsel)",
      "Gerçek zamanlı performans dashboard",
      "Haftalık optimizasyon notları",
      "Aylık ROAS raporu",
      "Rakip analizi sunumu",
    ],
  },
  {
    slug: "yaratici-yonetim",
    title: "Creative Direction",
    iconKey: "Palette",
    description: "Görsel kimlik ve yaratıcı strateji — marka sesini netleştiren tasarım dili.",
    body: "Sıradan tasarım, sıradan sonuç. FlixFlex yaratıcı yönetimi; markanızın özünden çıkan tutarlı, güçlü ve akılda kalan görsel bir dil oluşturur. Strateji ve estetiği birleştirerek her temas noktasında etki yaratır.",
    icon: Palette,
    subServices: [
      { label: "Art Direction", href: "/hizmetler/yaratici-yonetim", iconKey: "PenTool" },
      { label: "Motion Design", href: "/hizmetler/yaratici-yonetim", iconKey: "Clapperboard" },
      { label: "Marka Fotoğrafçılığı", href: "/hizmetler/yaratici-yonetim", iconKey: "Camera" },
      { label: "Kreatif Yazarlık", href: "/hizmetler/yaratici-yonetim", iconKey: "FileText" },
    ],
    features: [
      "Marka görsel dil sistemi",
      "Kampanya yaratıcı konseptleri",
      "Art direction & storyboard",
      "Çok kanallı tutarlılık denetimi",
    ],
    processSteps: [
      {
        title: "Marka Araştırması & Benchmark",
        description: "Markanın mevcut algısını, rakip görsel dillerini ve hedef kitle tercihlerini analiz ediyoruz.",
      },
      {
        title: "Konsept Geliştirme",
        description: "İki ila üç farklı yaratıcı yön üretilir; moodboard ve konsept brief ile sunulur.",
      },
      {
        title: "Tasarım Sistemi Oluşturma",
        description: "Seçilen yön renk, tipografi, ikonografi ve bileşen kütüphanesiyle belgelenir.",
      },
      {
        title: "Uygulama & Prodüksiyon",
        description: "Onaylanan sistem tüm kanallara (dijital, baskı, sosyal medya şablonları) uygulanır.",
      },
      {
        title: "Teslimat & Rehber Doküman",
        description: "Tüm varlıklar organize edilmiş dosya yapısıyla teslim edilir; kullanım kılavuzu eklenir.",
      },
    ],
    deliverables: [
      "Yaratıcı strateji brief",
      "Moodboard & konsept sunumu",
      "Tasarım sistemi rehberi",
      "Kampanya kreatif seti",
      "Sosyal medya şablonları",
      "Kullanım kılavuzu PDF",
    ],
  },
  {
    slug: "sosyal-medya-yonetimi",
    title: "Social Media Management",
    iconKey: "MessageSquare",
    description: "İçerik planlaması, topluluk yönetimi ve organik büyüme operasyonları.",
    body: "Sosyal medya bir yayın kanalı değil, topluluk inşa etme zeminidir. FlixFlex; içerik takvimi, yaratıcı üretim, topluluk yönetimi ve analitik raporlamayla markanızın sosyal medyadaki sesini güçlendirir.",
    icon: MessageSquare,
    subServices: [
      { label: "İçerik Stratejisi", href: "/hizmetler/sosyal-medya-yonetimi", iconKey: "FileText" },
      { label: "Topluluk Yönetimi", href: "/hizmetler/sosyal-medya-yonetimi", iconKey: "MessageCircle" },
      { label: "Reels & Kısa Video", href: "/hizmetler/sosyal-medya-yonetimi", iconKey: "Video" },
      { label: "Analitik & Raporlama", href: "/hizmetler/sosyal-medya-yonetimi", iconKey: "TrendingUp" },
    ],
    features: [
      "Aylık içerik takvimi & planlama",
      "Görsel ve metin üretimi",
      "Topluluk yönetimi & etkileşim",
      "Büyüme & analitik raporlama",
    ],
    processSteps: [
      {
        title: "Platform & Kitle Analizi",
        description: "Hangi platformlarda kimlerle konuşacağınızı, rakiplerinizin içerik stratejilerini netleştiriyoruz.",
      },
      {
        title: "İçerik Stratejisi & Takvim",
        description: "30 günlük içerik planı hazırlanır; tema, format ve yayın sıklığı belirlenir.",
      },
      {
        title: "Üretim & Onay Döngüsü",
        description: "Görseller, kopyalar ve Reels/Story formatları üretilir; onay sürecinden geçirilir.",
      },
      {
        title: "Yayın & Topluluk Yönetimi",
        description: "İçerikler zamanında yayınlanır, yorumlar ve DM'ler marka sesiyle yanıtlanır.",
      },
      {
        title: "Aylık Analiz & Strateji Revizyonu",
        description: "Erişim, etkileşim ve büyüme verileri raporlanır; bir sonraki ay için optimizasyonlar planlanır.",
      },
    ],
    deliverables: [
      "Aylık içerik takvimi",
      "Görseller & kopyalar (tüm formatlar)",
      "Topluluk yönetimi hizmeti",
      "Haftalık etkileşim özeti",
      "Aylık büyüme raporu",
      "Hashtag & trend stratejisi",
    ],
  },
  {
    slug: "marka-kimligi",
    title: "Brand Identity",
    iconKey: "Fingerprint",
    description: "Sıfırdan marka inşası; logo, renk sistemi, yazı ailesi ve ses tonu.",
    body: "Marka kimliği bir logo değil, bir vaattir. FlixFlex; markanızın temelini, kişiliğini, görsel dilini ve iletişim tonunu baştan sona inşa eder. Rakiplerinizden ayrışan, hedef kitlenizle rezonans kuran özgün bir kimlik.",
    icon: Fingerprint,
    subServices: [
      { label: "Logo & İşaret Tasarımı", href: "/hizmetler/marka-kimligi", iconKey: "Shapes" },
      { label: "Marka Kılavuzu", href: "/hizmetler/marka-kimligi", iconKey: "BookOpen" },
      { label: "İsimlendirme & Strateji", href: "/hizmetler/marka-kimligi", iconKey: "Lightbulb" },
      { label: "Görsel Kimlik Sistemi", href: "/hizmetler/marka-kimligi", iconKey: "Layout" },
    ],
    features: [
      "Logo & marka işareti tasarımı",
      "Renk paleti & tipografi sistemi",
      "Ses tonu & mesajlaşma rehberi",
      "Kapsamlı marka kılavuzu",
    ],
    processSteps: [
      {
        title: "Discovery & Strateji Atölyesi",
        description: "Marka değerleri, hedef kitle arketipleri, rekabetçi konumlandırma ve vizyon netleştirilir.",
      },
      {
        title: "İsim & Mesajlaşma Geliştirme",
        description: "Marka sesi, tagline ve temel mesajlar oluşturulur; hedef kitle testi yapılır.",
      },
      {
        title: "Logo & Görsel Kimlik Tasarımı",
        description: "Logo alternatifleri, renk sistemi ve tipografi geliştirilir; 2-3 yön sunulur.",
      },
      {
        title: "Sistem Geliştirme & Uygulama",
        description: "Seçilen kimlik; kartvizit, antet, dijital ve sosyal medya formatlarına uygulanır.",
      },
      {
        title: "Marka Kılavuzu Teslimatı",
        description: "Tüm kurallar, kullanım örnekleri ve yasaklar kapsamlı rehber dokümanda belgelenir.",
      },
    ],
    deliverables: [
      "Logo set (renk, siyah-beyaz, ters)",
      "Renk paleti & Pantone kodları",
      "Tipografi sistemi & lisanslar",
      "Ses tonu & mesajlaşma dokümanı",
      "Kurumsal kimlik uygulamaları",
      "Kapsamlı marka kılavuzu (PDF + Figma)",
    ],
  },
  {
    slug: "icerik-uretimi",
    title: "Content Production",
    iconKey: "Clapperboard",
    description: "Video, fotoğraf ve motion design ile markanızı görünür kılan içerikler.",
    body: "Dikkat ekonomisinde içerik, para birimidir. FlixFlex; ürün fotoğrafçılığından tanıtım filmlerine, motion grafiklerden sosyal medya içeriklerine kadar markanızı görsel olarak güçlendiren tüm prodüksiyon süreçlerini yönetir.",
    icon: Clapperboard,
    subServices: [
      { label: "Reklam Filmi", href: "/hizmetler/icerik-uretimi", iconKey: "Film" },
      { label: "Ürün Fotoğrafçılığı", href: "/hizmetler/icerik-uretimi", iconKey: "Camera" },
      { label: "Motion Graphics", href: "/hizmetler/icerik-uretimi", iconKey: "Sparkles" },
      { label: "Post Prodüksiyon", href: "/hizmetler/icerik-uretimi", iconKey: "Scissors" },
    ],
    features: [
      "Ürün & marka fotoğrafçılığı",
      "Tanıtım & reklam filmi üretimi",
      "Motion design & animasyon",
      "Sosyal medya içerik seti",
    ],
    processSteps: [
      {
        title: "Konsept & Senaryo Geliştirme",
        description: "Yaratıcı brief, hedef mesaj ve format belirlenir; senaryo ve storyboard hazırlanır.",
      },
      {
        title: "Prodüksiyon Planlaması",
        description: "Çekim takvimi, ekip, lokasyon ve ekipman planlaması yapılır; teknik brief hazırlanır.",
      },
      {
        title: "Çekim / Prodüksiyon",
        description: "Fotoğraf çekimi, video prodüksiyon veya motion tasarım aşaması gerçekleştirilir.",
      },
      {
        title: "Post Prodüksiyon & Renk",
        description: "Kurgu, renk düzenleme, ses miksajı ve grafik entegrasyonu tamamlanır.",
      },
      {
        title: "Teslimat & Format Optimizasyonu",
        description: "İçerikler tüm platform formatlarına (16:9, 9:16, 1:1) optimize edilerek teslim edilir.",
      },
    ],
    deliverables: [
      "Ham dosyalar & düzenlenmiş materyaller",
      "Platform bazlı format setleri",
      "Sosyal medya kesi seti",
      "Motion grafik dosyaları (After Effects)",
      "Yüksek çözünürlüklü fotoğraflar",
      "Kullanım hakları belgesi",
    ],
  },
  {
    slug: "web-ve-dijital",
    title: "Web & Digital",
    iconKey: "Globe",
    description: "Dijital vitrin ve deneyim tasarımı — dönüşüm odaklı modern web çözümleri.",
    body: "Web siteniz 24/7 çalışan en iyi satış temsilcinizdir. FlixFlex; UX araştırması, UI tasarımı ve modern geliştirme teknolojileriyle hız, estetik ve dönüşüm odaklı dijital deneyimler inşa eder.",
    icon: Globe,
    subServices: [
      { label: "Web Tasarım", href: "/hizmetler/web-ve-dijital", iconKey: "Monitor" },
      { label: "Web Geliştirme", href: "/hizmetler/web-ve-dijital", iconKey: "Code2" },
      { label: "UI/UX Tasarımı", href: "/hizmetler/web-ve-dijital", iconKey: "Layout" },
      { label: "SEO & Performans", href: "/hizmetler/web-ve-dijital", iconKey: "Zap" },
    ],
    features: [
      "UX araştırması & wireframe",
      "UI tasarımı & prototipleme",
      "Next.js / React geliştirme",
      "Dönüşüm optimizasyonu (CRO)",
    ],
    processSteps: [
      {
        title: "UX Araştırması & Strateji",
        description: "Kullanıcı yolculukları, persona analizi ve rakip benchmark ile bilgi mimarisi oluşturulur.",
      },
      {
        title: "Wireframe & Prototip",
        description: "Lo-fi wireframe'ler ve interaktif prototip hazırlanır; kullanıcı testleri yapılır.",
      },
      {
        title: "UI Tasarımı",
        description: "Figma'da yüksek kaliteli görsel tasarım tamamlanır; design system oluşturulur.",
      },
      {
        title: "Geliştirme & Entegrasyon",
        description: "Next.js ile hızlı, SEO-dostu ve dönüşüm odaklı frontend geliştirilir; CMS ve analytics entegrasyonları yapılır.",
      },
      {
        title: "Test & Lansman",
        description: "Performans, erişilebilirlik ve çapraz tarayıcı testleri tamamlanır; canlıya alış ve izleme kurulumu yapılır.",
      },
    ],
    deliverables: [
      "UX araştırma raporu & sitemap",
      "Wireframe seti (Figma)",
      "Yüksek kaliteli UI tasarımı",
      "Next.js kaynak kodu (GitHub)",
      "CMS & analytics entegrasyonu",
      "3 aylık bakım & destek paketi",
    ],
  },
]
