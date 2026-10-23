import type { Metadata } from "next"
import { Syne, DM_Sans, Geist, Outfit, Inter } from "next/font/google"
import { cookies, headers } from "next/headers"
import "./globals.css"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { ActivePaletteStyle } from "@/lib/colors/palette-provider"
import { cn } from "@/lib/utils";
import { Toaster } from "sonner"
import { getSetting } from "@/lib/settings"

// Aktif tema yalnızca Outfit + Inter kullanır; diğer aileler tanımlı kalır
// (tema değişirse kullanılabilir) ama her sayfada önceden yüklenmez (preload:false).
const geist = Geist({subsets:['latin'],variable:'--font-sans',preload:false});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
  preload: false,
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: false,
})

// Aktif temanın varsayılan fontları (Outfit + Inter) da self-host edilir;
// böylece tema bunları seçtiğinde runtime Google Fonts isteği gitmez.
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})

const metadataBaseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "https://flixflex.com.tr"

export async function generateMetadata(): Promise<Metadata> {
  // Favicon yalnızca admin'den (Ayarlar → Site → Site Favicon) seçildiyse gösterilir.
  // Seçilmediyse hiç favicon tanımlanmaz — statik favicon.ico kaldırıldığı için
  // Next/Vercel varsayılan faviconu da çıkmaz (site faviconsuz olur).
  const [favicon, metaTitle, metaDescription] = await Promise.all([
    getSetting<string>("site_favicon"),
    getSetting<string>("site_meta_title"),
    getSetting<string>("site_meta_description"),
  ])
  const defaultTitle = metaTitle || "FlixFlex — Next-Gen Reklam Ajansı"
  return {
    metadataBase: new URL(metadataBaseUrl),
    title: { default: defaultTitle, template: "%s | FlixFlex" },
    description: metaDescription || "Hız. Güç. Esneklik. FlixFlex ile markanızı büyütün.",
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: "FlixFlex",
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", site: "@flixflex" },
    robots: { index: true, follow: true },
    icons: favicon ? { icon: favicon, shortcut: favicon, apple: favicon } : undefined,
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const heads = await headers()
  const isAdmin = heads.get("x-is-admin") === "true"

  const cookieStore = await cookies()
  const themeCookie = cookieStore.get("theme")?.value
  // Accept only known values; fall back to "dark", force "light" for admin
  const theme: "dark" | "light" = isAdmin ? "light" : (themeCookie === "light" ? "light" : "dark")

  return (
    <html
      lang="tr"
      data-scroll-behavior="smooth"
      // The server writes the correct class so no flash occurs.
      // suppressHydrationWarning is kept for any residual client-side attribute
      // adjustments (e.g. color-scheme style) that happen synchronously on mount.
      suppressHydrationWarning
      className={cn(syne.variable, dmSans.variable, outfit.variable, inter.variable, theme, "font-sans", geist.variable)}
    >
      <body className="min-h-screen antialiased bg-[var(--background)] text-[var(--foreground)]">
        {/* LCP/medya kaynağına (R2 CDN) erken bağlantı — hero video/poster için
            el sıkışma gecikmesini azaltır. App Router bu <link>'i otomatik
            <head>'e taşır. */}
        {process.env.R2_PUBLIC_BASE_URL?.startsWith("https://") && (
          <link rel="preconnect" href={new URL(process.env.R2_PUBLIC_BASE_URL).origin} />
        )}
        {/* Active palette CSS vars — rendered server-side to avoid FOUC */}
        <ActivePaletteStyle />
        {/* a11y: skip to content for keyboard users */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[var(--ff-purple)] focus:text-white focus:text-sm focus:font-medium focus:uppercase focus:tracking-wider"
        >
          İçeriğe geç
        </a>
        <ThemeProvider serverTheme={theme} enableSystem={false}>
          {children}
          <Toaster position="bottom-right" theme={theme} expand={false} richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}

