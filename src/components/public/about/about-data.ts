// ═══════════════════════════════════════════════════════════
// FlixFlex — About Page Data
// Hakkımızda sayfası için tüm statik veriler
// ═══════════════════════════════════════════════════════════

import {
  Target,
  TrendingUp,
  Sparkles,
  Star,
  type LucideIcon,
} from "@/lib/icons"

// ── Value types ───────────────────────────────────
export interface Value {
  slug: string
  title: string
  titleTr: string
  icon: LucideIcon
  tagline: string
  description: string
}

export const VALUES: Value[] = [
  {
    slug: "hassasiyet",
    title: "Precision",
    titleTr: "Hassasiyet",
    icon: Target,
    tagline: "Her piksel, her kelime, her karar hesaplıdır.",
    description:
      "Rastgele değil, strateji. FlixFlex'te her kampanya, her içerik parçası ve her tasarım kararı veriye, içgüdüye ve mükemmele olan tutkuya dayanır. Ortalama sonuçlara yer yoktur.",
  },
  {
    slug: "buyume",
    title: "Growth",
    titleTr: "Büyüme",
    icon: TrendingUp,
    tagline: "Tek seferlik değil — sürdürülebilir ivme.",
    description:
      "Viral anlara değil, kalıcı büyümeye odaklanıyoruz. Ölçülebilir KPI'lar, veri döngüleri ve sürekli optimizasyon ile markanızın değeri her geçen ay birikimli olarak artar.",
  },
  {
    slug: "eglence",
    title: "Fun",
    titleTr: "Eğlence",
    icon: Sparkles,
    tagline: "İyi iş, iyi enerjiyle yapılır.",
    description:
      "Ciddi sonuçlar, ciddi yüzler gerektirmez. Ekibimizin yaratıcı enerjisi, müşterilerimizin markasına yansır. Eğlenceli, özgün ve cüretkar içerikler yarattığımızda kültür onları taşır.",
  },
  {
    slug: "premium",
    title: "Premium",
    titleTr: "Premium Standart",
    icon: Star,
    tagline: "En iyi ya da hiç.",
    description:
      "Orta seviyeye razı olmuyoruz. Her iş ortağımız için sanki kendi markamızmış gibi çalışıyoruz — her teslimatta yüksek standart, her müşteri görüşmesinde dürüst ve direkt iletişim.",
  },
]

// ── Team member types ──────────────────────────────
export interface TeamMember {
  name: string
  role: string
  initials: string
  accent?: boolean
  bio?: string
  links?: { label: string; href: string }[]
}

export const TEAM: TeamMember[] = [
  {
    name: "Kaan Aydın",
    role: "Kurucu & CEO",
    initials: "KA",
    accent: true,
    bio: "Marka stratejisi ve büyüme pazarlaması odaklı, 7 yıllık sektör deneyimi.",
    links: [{ label: "LinkedIn", href: "https://linkedin.com" }],
  },
  {
    name: "Defne Çelik",
    role: "CCO — Yaratıcı Direktör",
    initials: "DC",
    bio: "Reklam tasarımı ve marka kimliği alanında ödüllü, vizyoner bir yaratıcı.",
    links: [{ label: "Behance", href: "https://behance.net" }],
  },
  {
    name: "Mert Öztürk",
    role: "Performans Direktörü",
    initials: "MÖ",
    accent: true,
    bio: "Meta, Google ve TikTok ekosisteminde 50M+ TL bütçe yönetimi deneyimi.",
  },
  {
    name: "Selin Arslan",
    role: "İçerik Stratejisti",
    initials: "SA",
    bio: "Viral içerik mühendisliği ve community building konusunda uzman.",
    links: [{ label: "Instagram", href: "https://instagram.com" }],
  },
  {
    name: "Burak Yılmaz",
    role: "Teknik & MarTech Lideri",
    initials: "BY",
    accent: true,
    bio: "CRM entegrasyonları ve pazarlama otomasyonu mimarisi konularında uzman.",
  },
  {
    name: "Ayşe Koç",
    role: "Müşteri Deneyimi Lideri",
    initials: "AK",
    bio: "Müşteri ilişkilerini uzun vadeli ortaklıklara dönüştüren iletişim uzmanı.",
    links: [{ label: "LinkedIn", href: "https://linkedin.com" }],
  },
  {
    name: "Emre Şahin",
    role: "Video & Motion Tasarımcı",
    initials: "EŞ",
    bio: "Kısa format video ve animasyon ile sosyal medyada algı yaratma ustası.",
    links: [{ label: "Vimeo", href: "https://vimeo.com" }],
  },
  {
    name: "Naz Demir",
    role: "SEO & Veri Analisti",
    initials: "ND",
    accent: true,
    bio: "Organik büyüme ve veri analitiği ile karar mekanizmalarını şekillendiriyor.",
  },
]

// ── Differentiators ────────────────────────────────
export interface Differentiator {
  topic: string
  theirs: string
  ours: string
}

export const DIFFERENTIATORS: Differentiator[] = [
  {
    topic: "Strateji",
    theirs: "Şablonlar ve genel trendler.",
    ours: "Markanıza özel veri tabanlı strateji.",
  },
  {
    topic: "Raporlama",
    theirs: "Aylık PDF, boş metrikler.",
    ours: "Gerçek zamanlı dashboard, anlam taşıyan KPI'lar.",
  },
  {
    topic: "İletişim",
    theirs: "Haftalar süren e-posta zincirleri.",
    ours: "Dedicated hesap yöneticisi, 24 saat yanıt.",
  },
  {
    topic: "Sonuçlar",
    theirs: "Vaatler, belirsizlik, bahaneler.",
    ours: "Yazılı taahhütler, ölçülür büyüme hedefleri.",
  },
  {
    topic: "Fiyat",
    theirs: "Gizli ücretler, paket dayatması.",
    ours: "Şeffaf fiyatlandırma, ihtiyaca özel paketler.",
  },
]
