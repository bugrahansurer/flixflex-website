// ── Public site navigation data ───────────────────
// Tek bir kaynak — desktop & mobile her ikisi de buradan tüketir

export interface NavLink {
  label:        string
  href:         string
  hasMegaMenu?: boolean
}

export const NAV_LINKS: NavLink[] = [
  { label: "Hizmetler",  href: "/hizmetler", hasMegaMenu: true },
  { label: "İşlerimiz",  href: "/portfolio"     },
  { label: "Blog",       href: "/blog"      },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "İletişim",   href: "/iletisim"  },
]
