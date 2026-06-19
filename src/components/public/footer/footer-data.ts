export interface FooterColumn {
  title: string
  links: { label: string; href: string }[]
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Hizmetler",
    links: [
      { label: "Marka Stratejisi",    href: "/hizmetler/marka-kimligi" },
      { label: "Performans Reklamı",  href: "/hizmetler/performans-pazarlamasi" },
      { label: "Web & UX Tasarım",    href: "/hizmetler/web-ve-dijital" },
      { label: "İçerik & Yaratıcılık", href: "/hizmetler/icerik-uretimi" },
    ],
  },
  {
    title: "Keşfet",
    links: [
      { label: "İşlerimiz",   href: "/portfolio"   },
      { label: "Blog",         href: "/blog"       },
      { label: "Hakkımızda",   href: "/hakkimizda" },
      { label: "Kariyer",      href: "/kariyer"    },
    ],
  },
  {
    title: "İletişim",
    links: [
      { label: "Brief Başlat",        href: "/iletisim?type=brief" },
      { label: "Bizimle Çalış",        href: "/iletisim?type=partner" },
      { label: "Basın & PR",            href: "/iletisim?type=press" },
      { label: "Genel Sorular",         href: "/iletisim"             },
    ],
  },
  {
    title: "Yasal",
    links: [
      { label: "Gizlilik Politikası",   href: "/gizlilik-politikasi" },
      { label: "Kullanım Şartları",     href: "/kullanim-sartlari" },
      { label: "Çerez Tercihleri",      href: "/cerez-politikasi"  },
      { label: "KVKK",                   href: "/kvkk-aydinlatma-metni" },
    ],
  },
]

export interface SocialLink {
  label: string
  href:  string
  icon:  "instagram" | "linkedin" | "x" | "youtube" | "behance"
}

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Instagram", href: "https://instagram.com/flixflex", icon: "instagram" },
  { label: "LinkedIn",  href: "https://linkedin.com/company/flixflex", icon: "linkedin" },
  { label: "X",         href: "https://x.com/flixflex",          icon: "x" },
  { label: "YouTube",   href: "https://youtube.com/@flixflex",   icon: "youtube" },
  { label: "Behance",   href: "https://behance.net/flixflex",    icon: "behance" },
]
