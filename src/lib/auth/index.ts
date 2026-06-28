// ═══════════════════════════════════════════════════════════
// FlixFlex — NextAuth.js v5 (Auth.js) Configuration
//
// Exports the configured `auth`, `handlers`, `signIn`, and
// `signOut` functions for use throughout the application.
//
// NextAuth v5 returns these primitives from a single `NextAuth({})`
// call — they are wired into:
//   • Route handler  → src/app/api/auth/[...nextauth]/route.ts
//   • Middleware     → src/middleware.ts
//   • Server pages   → `await auth()` for session lookup
//   • Client UI      → `signIn`/`signOut` from "next-auth/react"
//
// Strategy: JWT sessions (so middleware can read claims via
// edge-safe JWT decode without a DB round-trip).
//
// Module augmentation below adds our RBAC-aware `roleId`,
// `roleName`, and `permissions` to the JWT + session types.
// ═══════════════════════════════════════════════════════════

import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { z } from "zod"

import prisma from "@/lib/prisma"
import { env } from "@/lib/env"
import { authConfig } from "@/lib/auth/config"
import type { SessionPermission } from "@/lib/auth/types"
import { decryptSecret } from "@/lib/crypto"
import { verifyTotpStep, hashBackupCode } from "@/lib/totp"
import { checkLimit, getClientIp, LOGIN, LOGIN_IP } from "@/lib/rate-limit"

// ── Credentials shape validation ────────────────────────
const credentialsSchema = z.object({
  email:      z.string().trim().toLowerCase().email(),
  password:   z.string().min(1),
  rememberMe: z.string().optional(), // "true" | "false" | undefined
})

// PrismaAdapter requires a working PrismaClient instance. During
// local dev before DATABASE_URL is configured, `@/lib/prisma`
// exports `undefined` — skip the adapter in that case so the
// app still builds. Credentials flow falls back to an in-memory
// "no users" state, which is the correct dev UX.
const adapter = prisma ? PrismaAdapter(prisma) : undefined

// ═══════════════════════════════════════════════════════════
// NextAuth instance
// ═══════════════════════════════════════════════════════════
export const { auth, handlers, signIn, signOut } = NextAuth({
  // Inherit edge-safe defaults (session strategy, pages, callbacks,
  // trustHost) from the shared config used by middleware.
  ...authConfig,

  // PrismaAdapter is kept for future OAuth/email-link support
  // (Credentials provider on its own does not require it, but
  // wiring it now means switching to OAuth providers later is
  // a one-line change).
  adapter,

  // Secret for JWT signing/encryption (validated by env schema).
  secret: env.NEXTAUTH_SECRET,

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email:      { label: "E-posta",    type: "email" },
        password:   { label: "Şifre",      type: "password" },
        totp:       { label: "2FA Kodu",   type: "text" },
        rememberMe: { label: "Beni hatırla", type: "text" },
      },
      async authorize(rawCredentials, req) {
        const emailInput = typeof rawCredentials?.email === "string" ? rawCredentials.email.trim().toLowerCase() : ""
        const passwordInput = typeof rawCredentials?.password === "string" ? rawCredentials.password : ""
        const totpInput = typeof rawCredentials?.totp === "string" ? rawCredentials.totp.replace(/\s/g, "") : ""
        const rememberMeInput = typeof rawCredentials?.rememberMe === "string" ? rawCredentials.rememberMe : "false"

        // 0. Login rate limit — two-tier brute-force defence.
        //
        //    Tier 1 (IP-only): 50 attempts per 15 min from a single IP across
        //    ALL target emails. Blocks credential-stuffing attacks that rotate
        //    email addresses to avoid per-credential limits.
        //
        //    Tier 2 (IP:email composite): 10 attempts per 15 min per specific
        //    credential pair. Blocks focused password-guessing against a
        //    single account.
        //
        //    Both checks fall back gracefully when req is undefined (e.g.
        //    server-side signIn() calls where ip is "unknown").
        //
        //    Skipped in development: brute-force protection is a production
        //    concern, and rate-limiting login on localhost only locks the
        //    developer out while testing.
        if (env.NODE_ENV !== "development") {
          const ip = req ? getClientIp(req as Request) : "unknown"

          const loginIpRl = await checkLimit(LOGIN_IP, ip)
          if (!loginIpRl.allowed) {
            console.warn("[auth] login IP rate limit exceeded", { ip })
            // Return null — NextAuth surfaces a generic "invalid credentials"
            // message; we deliberately do NOT reveal that this is a rate limit
            // to avoid enumeration via timing/response differences.
            return null
          }

          const rlKey = `${ip}:${emailInput}`
          const loginRl = await checkLimit(LOGIN, rlKey)
          if (!loginRl.allowed) {
            console.warn("[auth] login rate limit exceeded", { ip, email: emailInput })
            return null
          }
        }

        // 1. Validate shape
        const parsed = credentialsSchema.safeParse({ email: emailInput, password: passwordInput, rememberMe: rememberMeInput })
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const rememberMe = parsed.data.rememberMe === "true"

        // 2. Try Prisma lookup. If the call THROWS in dev with the
        //    explicit fallback flag set, we fall through to the dev
        //    fallback below. A null return (user-not-found) is the
        //    normal path and never triggers the fallback. Production
        //    NEVER uses the fallback.
        let user: any = null
        let prismaThrew = false

        if (prisma) {
          try {
            user = await prisma.user.findUnique({
              where:   { email: email.toLowerCase() },
              include: {
                role: { include: { permissions: true } },
              },
            })
          } catch (err) {
            prismaThrew = true
            if (env.NODE_ENV === "production") {
              console.error("[auth] Prisma query failed in production:", err)
              return null
            }
            console.warn("[auth] DB unreachable in dev — Prisma threw:", err)
          }
        }

        // 3. Dev-only fallback: accept the seed default credentials so
        //    the admin UI can be exercised without standing up Postgres.
        //    Strictly gated:
        //      • only when Prisma actually THREW (not when user is null)
        //      • only in development
        //      • only when NEXTAUTH_FALLBACK_ADMIN === "1"
        //    NEVER active in production.
        if (
          prismaThrew &&
          env.NODE_ENV === "development" &&
          process.env.NEXTAUTH_FALLBACK_ADMIN === "1"
        ) {
          const FALLBACK_EMAIL = "admin@flixflex.com"
          const FALLBACK_PASSWORD = "FlixFlex2026!"
          if (
            email.toLowerCase() === FALLBACK_EMAIL &&
            password === FALLBACK_PASSWORD
          ) {
            console.warn(
              "[auth] DEV FALLBACK ADMIN credentials accepted. " +
              "Unset NEXTAUTH_FALLBACK_ADMIN to disable."
            )
            return {
              id:         "dev-super-admin",
              email:      FALLBACK_EMAIL,
              name:       "Dev Super Admin",
              image:      null,
              roleId:     "dev-role",
              roleName:   "Super Admin",
              permissions: [{ resource: "*", action: "*", scope: null }],
              rememberMe,
            }
          }
          return null
        }

        // 4. Constant-time defence against user enumeration.
        //    If the user is missing/inactive/passwordless, still run a
        //    bcrypt.compare against a known dummy hash so the response
        //    time matches the genuine compare path below.
        //    DUMMY_HASH is bcrypt("dummy-password", 12) — a real,
        //    valid bcrypt digest, just for a value no user will ever
        //    enter.
        const DUMMY_HASH =
          "$2b$12$FidO4r0BBh4DMG0kdVDThuIIY3rIc1TT1VO20ImWEpuZF5WEfmkAi"
        // [LOGIN-DEBUG] geçici — sorun teşhisi için
        console.warn("[LOGIN-DEBUG] lookup", {
          emailLooked: email.toLowerCase(),
          userFound: !!user,
          isActive: user?.isActive,
          hasPassword: !!user?.password,
          twoFA: user?.twoFactorEnabled,
          nodeEnv: env.NODE_ENV,
        })

        if (!user || !user.isActive || !user.password) {
          await bcrypt.compare(password, DUMMY_HASH)
          console.warn("[LOGIN-DEBUG] reddedildi: kullanıcı yok/pasif/şifresiz")
          return null
        }

        // 5. Verify password using bcryptjs
        const ok = await bcrypt.compare(password, user.password)
        console.warn("[LOGIN-DEBUG] şifre eşleşmesi:", ok)
        if (!ok) return null

        // 5b. Second factor — only enforced for accounts that enabled it.
        //     Accepts a current TOTP code OR a one-time backup code.
        //     Fail-safe: accounts WITHOUT 2FA are completely unaffected.
        if (user.twoFactorEnabled && user.twoFactorSecret) {
          let twoFaOk = false
          try {
            const secret = decryptSecret(user.twoFactorSecret)
            const matchedStep = totpInput ? verifyTotpStep(secret, totpInput) : null

            if (matchedStep !== null) {
              // TOTP path — reject codes at/before the last consumed step
              // (replay prevention), then advance the watermark atomically.
              const lastStep = user.twoFactorLastUsedStep ?? -1
              if (matchedStep > lastStep && prisma) {
                const res = await prisma.user.updateMany({
                  where: { id: user.id, twoFactorLastUsedStep: user.twoFactorLastUsedStep ?? null },
                  data: { twoFactorLastUsedStep: matchedStep },
                })
                twoFaOk = res.count > 0
              }
            } else if (totpInput && prisma) {
              // Backup-code path — atomic one-time consumption.
              const codeHash = hashBackupCode(totpInput)
              const res = await prisma.user.updateMany({
                where: { id: user.id, twoFactorBackupCodes: { has: codeHash } },
                data: {
                  twoFactorBackupCodes: {
                    set: ((user.twoFactorBackupCodes ?? []) as string[]).filter((c: string) => c !== codeHash),
                  },
                },
              })
              twoFaOk = res.count > 0
            }
          } catch (err) {
            console.error("[auth] 2FA verification error:", err)
          }
          if (!twoFaOk) return null
        }

        // 5. Update lastLogin (fire-and-forget — never block auth)
        if (prisma) {
          prisma.user
            .update({
              where: { id: user.id },
              data:  { lastLogin: new Date() },
            })
            .catch((err: unknown) => {
              console.warn("[auth] lastLogin update failed:", err)
            })
        }

        // 6. Shape user object for jwt callback
        const permissions: SessionPermission[] = (user.role?.permissions ?? []).map(
          (p: { resource: string; action: string; scope: string | null }) => ({
            resource: p.resource,
            action:   p.action,
            scope:    p.scope ?? null,
          })
        )

        return {
          id:          user.id,
          email:       user.email,
          name:        user.name ?? user.email,
          image:       user.image ?? null,
          roleId:      user.roleId,
          roleName:    user.role?.name ?? "Viewer",
          permissions,
          rememberMe,
        }
      },
    }),
  ],

  // session, pages, trustHost, and callbacks come from authConfig (spread above).
})

// ═══════════════════════════════════════════════════════════
// Module augmentation — extend NextAuth types with RBAC fields
// ═══════════════════════════════════════════════════════════
declare module "next-auth" {
  interface Session {
    user: {
      id:          string
      roleId:      string
      roleName:    string
      /** Alias of `roleName` — kept for legacy `SessionUser.role` callers. */
      role:        string
      permissions: SessionPermission[]
      initials:    string
    } & DefaultSession["user"]
  }

  interface User {
    id?:          string
    roleId?:      string
    roleName?:    string
    permissions?: SessionPermission[]
    rememberMe?:  boolean
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?:          string
    roleId?:      string
    roleName?:    string
    permissions?: SessionPermission[]
    rememberMe?:  boolean
  }
}
