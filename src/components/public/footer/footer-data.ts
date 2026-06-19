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

// Social links now live in the DB (site_settings → `site_social_links`) and
// are managed from /admin/ayarlar/site. The catalog + defaults moved to
// `@/lib/social-platforms`. See parseSocialLinks() for the runtime shape.
