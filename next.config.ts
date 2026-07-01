import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // ── Dev cross-origin (HMR over LAN IP) ────────────
  // Next.js 16 blocks dev assets / HMR websocket requests from
  // origins other than localhost by default. When the dev server is
  // opened via a LAN IP (e.g. http://10.3.5.57:3000 from another
  // device), the `_next/webpack-hmr` socket fails. Allow-list the
  // dev machine's LAN IP so hot reload works across devices.
  // Add more IPs here if you access the dev server from other hosts.
  // NOTE: your machine's LAN IP changes per network (e.g. switching to a
  // phone hotspot puts you on the 172.20.10.x range). If the mobile preview
  // shows blank/animation-less sections, check the dev-server warning for the
  // blocked origin and add that IP here, then restart the dev server.
  allowedDevOrigins: ["10.3.5.57", "172.20.10.2", "172.20.10.1"],

  // ── Image Optimization ────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "image.mux.com" },
      { protocol: "https", hostname: "me7aitdbxq.ufs.sh" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // ── Performance ──────────────────────────────────
  experimental: {
    optimizePackageImports: [
      "@tabler/icons-react",
      "framer-motion",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-dialog",
    ],
  },

  // ── Headers ──────────────────────────────────────
  async headers() {
    const isDev = process.env.NODE_ENV === "development"
    const wsRules = isDev ? "ws: wss: ws://* wss://* " : ""
    // The dynamic-code script directive is only required by the dev
    // runtime (Turbopack / React Refresh). Production bundles do not
    // need it, so omit it there to shrink the script-src surface.
    const evalRule = isDev ? "'unsafe-eval' " : ""

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // ── HSTS: force HTTPS for 2 years, include subdomains, eligible for preload list.
          {
            key:   "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // ── CSP: locks down script/style/font/img/media/connect sources.
          // 'unsafe-inline' on script-src is required by Next.js today
          // (for the hydration runtime). Can be tightened with nonces
          // in a follow-up. Mux player + Anthropic + Google Fonts
          // origins are allow-listed explicitly.
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              `script-src 'self' 'unsafe-inline' ${evalRule}https://*.mux.com https://www.gstatic.com https://www.googletagmanager.com https://*.google-analytics.com https://connect.facebook.net; ` +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com data:; " +
              "img-src 'self' data: blob: https:; " +
              "media-src 'self' blob: https://*.mux.com; " +
              `connect-src 'self' ${wsRules}https://*.mux.com https://*.litix.io https://api.anthropic.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://connect.facebook.net https://www.facebook.com; ` +
              "frame-src 'self' https://www.googletagmanager.com https://td.doubleclick.net; " +
              "frame-ancestors 'none';",
          },
        ],
      },
      {
        // Static assets — long cache
        source: "/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ]
  },

  // ── Redirects ────────────────────────────────────
  // Legacy /admin/renkler → /admin/theme (bookmark compat)
  async redirects() {
    return [
      {
        source: "/admin/renkler",
        destination: "/admin/theme",
        permanent: true,
      },
      {
        source: "/admin/renkler/:path*",
        destination: "/admin/theme/:path*",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
