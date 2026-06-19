"use client"

import * as React from "react"
import Image from "next/image"
import { FFButton } from "@/components/ui"
import { Shield, ShieldCheck, Loader2, Copy, Check } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Step = "idle" | "setup" | "backup"

export function SecurityForm({ initiallyEnabled }: { initiallyEnabled: boolean }) {
  const [enabled, setEnabled] = React.useState(initiallyEnabled)
  const [step, setStep] = React.useState<Step>("idle")
  const [loading, setLoading] = React.useState(false)

  const [qr, setQr] = React.useState("")
  const [secret, setSecret] = React.useState("")
  const [code, setCode] = React.useState("")
  const [backupCodes, setBackupCodes] = React.useState<string[]>([])
  const [disableCode, setDisableCode] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  async function startSetup() {
    setLoading(true)
    try {
      const res = await fetch("/api/security/2fa/setup", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Kurulum başlatılamadı")
      setQr(data.qr)
      setSecret(data.secret)
      setStep("setup")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata")
    } finally {
      setLoading(false)
    }
  }

  async function verifyEnable() {
    setLoading(true)
    try {
      const res = await fetch("/api/security/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Doğrulama başarısız")
      setBackupCodes(data.backupCodes)
      setEnabled(true)
      setStep("backup")
      setCode("")
      toast.success("İki adımlı doğrulama etkinleştirildi.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata")
    } finally {
      setLoading(false)
    }
  }

  async function disable2fa() {
    setLoading(true)
    try {
      const res = await fetch("/api/security/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: disableCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Devre dışı bırakılamadı")
      setEnabled(false)
      setStep("idle")
      setDisableCode("")
      toast.success("İki adımlı doğrulama kapatıldı.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata")
    } finally {
      setLoading(false)
    }
  }

  function copyBackup() {
    navigator.clipboard.writeText(backupCodes.join("\n")).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="max-w-2xl space-y-6 pb-20">
      {/* Status header */}
      <div
        className={cn(
          "ff-shape-container p-6 border flex items-center gap-4",
          enabled ? "bg-[#16a34a]/8 border-[#16a34a]/30" : "bg-[#F7F7F5] border-[#CCCCCC]"
        )}
      >
        <span
          className={cn(
            "ff-shape-button w-12 h-12 flex items-center justify-center border shrink-0",
            enabled ? "bg-[#16a34a]/15 text-[#16a34a] border-[#16a34a]/30" : "bg-[#F0F0F0] text-[#666666] border-[#CCCCCC]"
          )}
        >
          {enabled ? <ShieldCheck size={22} /> : <Shield size={22} />}
        </span>
        <div className="flex-1">
          <h3 className="font-display text-base font-bold text-[#333333]">İki Adımlı Doğrulama (2FA)</h3>
          <p className="text-[12px] text-[#666666]">
            {enabled
              ? "Aktif — girişte kimlik doğrulama uygulaması kodu istenir."
              : "Kapalı — hesabınız yalnızca şifreyle korunuyor."}
          </p>
        </div>
        {step === "idle" && !enabled && (
          <FFButton onClick={startSetup} disabled={loading} leftIcon={loading ? <Loader2 className="animate-spin" size={15} /> : undefined}>
            Etkinleştir
          </FFButton>
        )}
      </div>

      {/* Setup step */}
      {step === "setup" && (
        <div className="ff-shape-container p-6 bg-[#F7F7F5] border border-[#CCCCCC] space-y-5">
          <div>
            <h4 className="font-display text-sm font-bold text-[#333333] mb-1">1. Uygulamayla tara</h4>
            <p className="text-[12px] text-[#666666]">Google Authenticator, 1Password, Authy vb. ile QR kodu okutun.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {qr && (
              <Image src={qr} alt="2FA QR" width={180} height={180} unoptimized className="ff-shape-container border border-[#CCCCCC] bg-white" />
            )}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Manuel anahtar</p>
              <code className="block text-[12px] font-mono text-[#333333] bg-[#F0F0F0] border border-[#CCCCCC] px-3 py-2 break-all">{secret}</code>
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-[#333333] mb-2">2. Kodu doğrula</h4>
            <div className="flex items-center gap-3">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
                inputMode="numeric"
                maxLength={6}
                placeholder="6 haneli kod"
                className="ff-shape-container w-40 px-3 py-2.5 text-sm font-mono tracking-widest bg-white border border-[#CCCCCC] text-[#333333] outline-none focus:border-[#ff4fd8]"
              />
              <FFButton onClick={verifyEnable} disabled={loading || code.length !== 6} leftIcon={loading ? <Loader2 className="animate-spin" size={15} /> : undefined}>
                Doğrula ve Etkinleştir
              </FFButton>
            </div>
          </div>
        </div>
      )}

      {/* Backup codes */}
      {step === "backup" && backupCodes.length > 0 && (
        <div className="ff-shape-container p-6 bg-[var(--warning)]/5 border border-[var(--warning)]/30 space-y-4">
          <h4 className="font-display text-sm font-bold text-[#333333]">Yedek Kodlarınızı Kaydedin</h4>
          <p className="text-[12px] text-[#666666]">
            Telefonunuza erişiminizi kaybederseniz bu kodlarla giriş yapabilirsiniz. Her kod yalnızca bir kez kullanılır.
            <strong> Bu kodlar tekrar gösterilmeyecek.</strong>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((c) => (
              <code key={c} className="text-[13px] font-mono text-[#333333] bg-white border border-[#CCCCCC] px-3 py-2 text-center">{c}</code>
            ))}
          </div>
          <div className="flex gap-3">
            <FFButton variant="ghost" onClick={copyBackup} leftIcon={copied ? <Check size={15} /> : <Copy size={15} />}>
              {copied ? "Kopyalandı" : "Kopyala"}
            </FFButton>
            <FFButton onClick={() => setStep("idle")}>Tamamladım</FFButton>
          </div>
        </div>
      )}

      {/* Disable */}
      {enabled && step === "idle" && (
        <div className="ff-shape-container p-6 bg-[#F7F7F5] border border-[#CCCCCC] space-y-3">
          <h4 className="font-display text-sm font-bold text-[#333333]">2FA&apos;yı devre dışı bırak</h4>
          <p className="text-[12px] text-[#666666]">Onaylamak için mevcut bir doğrulama kodu veya yedek kod girin.</p>
          <div className="flex items-center gap-3">
            <input
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\s/g, ""))}
              placeholder="Kod"
              className="ff-shape-container w-48 px-3 py-2.5 text-sm font-mono bg-white border border-[#CCCCCC] text-[#333333] outline-none focus:border-[#ff4fd8]"
            />
            <FFButton
              variant="ghost"
              onClick={disable2fa}
              disabled={loading || !disableCode}
              className="text-[var(--error)] border-[var(--error)]/30 hover:bg-[var(--error)]/10"
            >
              Devre Dışı Bırak
            </FFButton>
          </div>
        </div>
      )}
    </div>
  )
}
