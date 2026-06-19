import type { Metadata } from "next"
import { Syne, DM_Sans, Geist } from "next/font/google"
import { cookies, headers } from "next/headers"
import "./globals.css"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { FFCursor } from "@/components/ui"
import { ActivePaletteStyle } from "@/lib/colors/palette-provider"
import { cn } from "@/lib/utils";
import { Toaster } from "sonner"

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
})

const metadataBaseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "https://flixflex.com"

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: { default: "FlixFlex — Next-Gen Reklam Ajansı", template: "%s | FlixFlex" },
  description: "Hız. Güç. Esneklik. FlixFlex ile markanızı büyütün.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "FlixFlex",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", site: "@flixflex" },
  robots: { index: true, follow: true },
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
      // The server writes the correct class so no flash occurs.
      // suppressHydrationWarning is kept for any residual client-side attribute
      // adjustments (e.g. color-scheme style) that happen synchronously on mount.
      suppressHydrationWarning
      className={cn(syne.variable, dmSans.variable, theme, "font-sans", geist.variable)}
    >
      <body className="min-h-screen antialiased bg-[var(--background)] text-[var(--foreground)]">
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
          <FFCursor />
          {children}
          <Toaster position="bottom-right" theme={theme} expand={false} richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}

