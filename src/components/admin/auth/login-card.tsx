"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "@/lib/icons"
import { FFInput } from "@/components/ui"
import { cn } from "@/lib/utils"
import { fadeInUp } from "@/lib/animations"

// ── Map NextAuth error codes → Turkish UI copy ─────
// NextAuth surfaces error codes via the `?error=...` query param
// after a failed redirect-style sign-in, and via `result.error`
// when `redirect: false`. We translate the common ones here.
const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "E-posta veya şifre hatalı",
  CallbackRouteError: "E-posta veya şifre hatalı",
  AccessDenied: "Erişim reddedildi",
  Configuration: "Sunucu yapılandırma hatası — yöneticiyle iletişime geçin",
  Verification: "Doğrulama bağlantısı geçersiz veya süresi dolmuş",
  default: "Giriş sırasında bir hata oluştu. Tekrar deneyin.",
}

function translateError(code: string | null | undefined): string {
  if (!code) return ERROR_MESSAGES.default
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES.default
}

export function LoginCard() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // `callbackUrl` comes from middleware redirects; `error` is set
  // by NextAuth when a previous attempt failed with redirect=true.
  // We sanitize the callbackUrl to ensure it's a relative path,
  // preventing redirects to localhost or external sites.
  const rawCallback = searchParams?.get("callbackUrl") ?? "/admin"
  const callbackUrl = React.useMemo(() => {
    try {
      // If it's a full URL, extract the path if it matches our origin,
      // otherwise fallback to /admin.
      if (rawCallback.startsWith("http")) {
        const url = new URL(rawCallback)
        if (typeof window !== "undefined" && url.origin === window.location.origin) {
          return url.pathname + url.search
        }
        return "/admin"
      }
      return rawCallback
    } catch {
      return "/admin"
    }
  }, [rawCallback])

  const initialError = searchParams?.get("error")

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [totp, setTotp] = React.useState("")
  const [showTotp, setShowTotp] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [rememberMe, setRememberMe] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(
    initialError ? translateError(initialError) : null
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("E-posta ve şifre zorunludur.")
      return
    }

    setLoading(true)

    try {
      // Use redirect:false so we can show inline validation errors
      // instead of bouncing to NextAuth's default error page.
      const result = await signIn("credentials", {
        email,
        password,
        totp: totp.trim(),
        redirect: false,
        callbackUrl,
      })

      if (!result) {
        setError(ERROR_MESSAGES.default)
        return
      }

      if (result.error) {
        setError(translateError(result.error))
        return
      }

      // On success, NextAuth sets the session cookie — push to the
      // intended destination. `result.url` is populated when a
      // callbackUrl was passed; fall back to `callbackUrl` prop.
      const dest = result.url ?? callbackUrl ?? "/admin"
      router.push(dest)
      router.refresh()
    } catch {
      setError(ERROR_MESSAGES.default)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full max-w-[420px] mx-auto px-4">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className={cn(
          "ff-shape-container relative z-10",
          "bg-[var(--border)]",
          "p-[1px]"
        )}
      >
        {/* Rotating border beam */}
        <div
          className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] pointer-events-none z-0 animate-[spin_4s_linear_infinite]"
          style={{
            background: "conic-gradient(from 0deg, transparent 55%, var(--ff-purple) 90%, transparent 100%)",
          }}
        />

        {/* Inner Card Content */}
        <div className="ff-shape-container relative z-10 w-full h-full bg-[var(--background)] p-8 md:p-10">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <span className="font-display font-extrabold text-3xl tracking-tight text-[var(--foreground)]">
              Flix<span className="text-[var(--ff-purple)]">Flex</span>
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="font-display text-xl font-bold text-[var(--foreground)]">
              Admin Girişi
            </h1>
            <p className="text-[13px] text-[var(--foreground-muted)] mt-1.5">
              FlixFlex yönetim paneline erişin
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "ff-shape-container flex items-start gap-2.5 mb-6",
                "bg-red-500/10 border border-red-500/30",
                "px-4 py-3 text-[13px] text-red-400"
              )}
              role="alert"
              aria-live="polite"
            >
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <FFInput
              label="E-posta"
              type="email"
              placeholder="ornek@eposta.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={15} />}
              autoComplete="email"
              disabled={loading}
            />

            <FFInput
              label="Şifre"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={15} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-[var(--foreground-faint)] hover:text-[var(--foreground)] transition-colors"
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              autoComplete="current-password"
              disabled={loading}
            />

            {/* Optional 2FA code — only required for accounts with 2FA enabled */}
            {showTotp ? (
              <FFInput
                label="2FA Kodu"
                type="text"
                inputMode="numeric"
                placeholder="6 haneli kod veya yedek kod"
                value={totp}
                onChange={(e) => setTotp(e.target.value)}
                leftIcon={<Lock size={15} />}
                autoComplete="one-time-code"
                disabled={loading}
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowTotp(true)}
                className="text-[12px] text-[var(--foreground-muted)] hover:text-[var(--ff-purple)] transition-colors"
              >
                İki adımlı doğrulama (2FA) kullanıyorum
              </button>
            )}

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <button
                type="button"
                role="checkbox"
                aria-checked={rememberMe}
                onClick={() => setRememberMe((v) => !v)}
                className={cn(
                  "w-4 h-4 border border-[var(--border)] flex items-center justify-center shrink-0 rounded-full transition-colors duration-150",
                  rememberMe
                    ? "bg-[var(--ff-purple)] border-[var(--ff-purple)]"
                    : "bg-[var(--background)] group-hover:border-[var(--ff-purple)]"
                )}
              >
                {rememberMe && (
                  <svg
                    width="9"
                    height="7"
                    viewBox="0 0 9 7"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path
                      d="M1 3L3.5 5.5L8 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="square"
                    />
                  </svg>
                )}
              </button>
              <span className="text-[13px] text-[var(--foreground-muted)] select-none">
                Beni hatırla
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "ff-shape-button w-full relative flex items-center justify-center gap-2",
                "py-3 text-[13px] font-medium uppercase tracking-[0.07em]",
                "bg-[var(--ff-purple)] text-white border border-[var(--ff-purple)]",
                "hover:bg-[var(--ff-purple-dark)] hover:border-[var(--ff-purple-dark)]",
                "hover:shadow-[0_4px_24px_rgba(var(--ff-purple)/40)]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-200 active:scale-[0.98]"
              )}
            >
              {loading ? (
                <>
                  <span
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    style={{ animation: "spin 0.7s linear infinite" }}
                  />
                  Giriş yapılıyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] text-[var(--foreground-faint)]">
            FlixFlex Yönetim Paneli | Sürüm v2.0
          </p>
        </div>
      </motion.div>
    </div>
  )
}
