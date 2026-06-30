"use client"

import React, { useState, FormEvent } from "react"
import { Mail, ShieldAlert, KeyRound, Server, Save, Loader2, Play } from "@/lib/icons"
import { FFButton, FFInput, FFSelect, FFSelectItem } from "@/components/ui"
import { Can } from "@/components/admin/rbac/permission-context"
import { toast } from "sonner"

interface EmailSettingsFormProps {
  initialSettings: Record<string, string>
  saveAction: (formData: FormData) => Promise<void>
}

export function EmailSettingsForm({ initialSettings, saveAction }: EmailSettingsFormProps) {
  const [provider, setProvider] = useState(initialSettings["mail.provider"] || "mock")
  const [fromAddress, setFromAddress] = useState(initialSettings["mail.from"] || "FlixFlex <onboarding@resend.dev>")
  const [resendKey, setResendKey] = useState(initialSettings["mail.resend.key"] || "")
  const [smtpHost, setSmtpHost] = useState(initialSettings["mail.smtp.host"] || "")
  const [smtpPort, setSmtpPort] = useState(initialSettings["mail.smtp.port"] || "587")
  const [smtpUser, setSmtpUser] = useState(initialSettings["mail.smtp.user"] || "")
  const [smtpPass, setSmtpPass] = useState(initialSettings["mail.smtp.pass"] || "")
  const [smtpSecure, setSmtpSecure] = useState(initialSettings["mail.smtp.secure"] || "false")

  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testRecipient, setTestRecipient] = useState("")

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData()
    formData.append("mail.provider", provider)
    formData.append("mail.from", fromAddress)
    formData.append("mail.resend.key", resendKey)
    formData.append("mail.smtp.host", smtpHost)
    formData.append("mail.smtp.port", smtpPort)
    formData.append("mail.smtp.user", smtpUser)
    formData.append("mail.smtp.pass", smtpPass)
    formData.append("mail.smtp.secure", smtpSecure)

    try {
      await saveAction(formData)
      toast.success("E-posta ayarları başarıyla kaydedildi.")
    } catch (err) {
      console.error(err)
      toast.error("Ayarlar kaydedilirken bir hata oluştu.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendTestMail = async () => {
    if (!testRecipient.trim()) {
      toast.error("Lütfen test e-postasının gönderileceği alıcı adresini girin.")
      return
    }

    setIsTesting(true)
    const promise = fetch("/api/settings/email/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        from: fromAddress,
        resendKey,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
        smtpSecure,
        testEmail: testRecipient.trim(),
      }),
    })

    toast.promise(promise, {
      loading: "Bağlantı kuruluyor ve test e-postası gönderiliyor...",
      success: async (res) => {
        setIsTesting(false)
        const data = await res.json()
        if (res.ok && data.success) {
          return `Test e-postası başarıyla gönderildi! Lütfen ${testRecipient} gelen kutusunu kontrol edin.`
        } else {
          throw new Error(data.error || "Sunucu ile bağlantı kurulamadı.")
        }
      },
      error: (err) => {
        setIsTesting(false)
        return `Gönderim başarısız: ${err.message}`
      },
    })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSave} className="space-y-4">
        {/* ── Section: Provider & General ──────────────────── */}
        <section className="ff-card bg-[#f7f7f5] border border-[#CCCCCC] p-4 md:p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-[#CCCCCC]">
            <Mail size={18} className="text-[#ff4fd8]" />
            <h2 className="font-display text-lg text-[#333333] font-bold">Sağlayıcı Ayarları</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#333333]">E-posta Servis Sağlayıcı</label>
              <FFSelect value={provider} onValueChange={setProvider}>
                <FFSelectItem value="mock" hint="Log/Dev mod">Mock Modu (Sunucuda loglanır, mail gitmez)</FFSelectItem>
                <FFSelectItem value="smtp" hint="Özel SMTP Sunucusu">SMTP Sunucusu (Nodemailer)</FFSelectItem>
                <FFSelectItem value="resend" hint="Modern Mail API">Resend API Entegrasyonu</FFSelectItem>
              </FFSelect>
              <p className="text-[10px] text-[#666666] leading-relaxed pt-1">
                Platform randevu onay maillerini gönderirken bu entegrasyonu kullanacaktır.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#333333]">Gönderen E-posta (From)</label>
              <FFInput
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                placeholder="Örn: FlixFlex <onboarding@resend.dev>"
                className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
              />
              <p className="text-[10px] text-[#666666] leading-relaxed pt-1">
                Kullanıcılara giden e-postanın kimden geldiğini belirtir. SMTP ayarlarında kullanıcı adınızla uyuşmalıdır.
              </p>
            </div>
          </div>
        </section>

        {/* ── Section: SMTP Sunucusu ──────────────────────── */}
        {provider === "smtp" && (
          <section className="ff-card bg-[#f7f7f5] border border-[#CCCCCC] p-4 md:p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-[#CCCCCC]">
              <Server size={18} className="text-[var(--ff-purple)]" />
              <h2 className="font-display text-lg text-[#333333] font-bold">SMTP Sunucu Detayları</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#333333]">SMTP Host / Sunucu</label>
                <FFInput
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="Örn: mail.kurumsal.com veya smtp.gmail.com"
                  className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#333333]">Port</label>
                  <FFInput
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587, 465 veya 25"
                    className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#333333]">Güvenli Bağlantı</label>
                  <FFSelect value={smtpSecure} onValueChange={setSmtpSecure}>
                    <FFSelectItem value="false" hint="Port 587 veya 25">TLS / STARTTLS (false)</FFSelectItem>
                    <FFSelectItem value="true" hint="Port 465">SSL (true)</FFSelectItem>
                  </FFSelect>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#333333]">SMTP Kullanıcı Adı (Email)</label>
                <FFInput
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="Örn: randevu@kurumsal.com"
                  className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#333333]">SMTP Şifresi</label>
                <FFInput
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="••••••••••••••"
                  className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
                />
              </div>
            </div>
          </section>
        )}

        {/* ── Section: Resend API Entegrasyonu ───────────────── */}
        {provider === "resend" && (
          <section className="ff-card bg-[#f7f7f5] border border-[#CCCCCC] p-4 md:p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-[#CCCCCC]">
              <KeyRound size={18} className="text-[#FF4FD8]" />
              <h2 className="font-display text-lg text-[#333333] font-bold">Resend API Ayarları</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#333333]">Resend API Key</label>
                <FFInput
                  type="password"
                  value={resendKey}
                  onChange={(e) => setResendKey(e.target.value)}
                  placeholder="re_••••••••••••••••••••••••"
                  className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
                />
                <p className="text-[10px] text-[#666666] leading-relaxed pt-1">
                  Resend.com panelinden aldığınız API anahtarını buraya girin. Eğer boş bırakırsanız, sunucu ortam değişkenlerindeki <code>RESEND_API_KEY</code> değeri kullanılır.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── Actions ────────────────────────── */}
        <Can resource="settings" action="update">
          <div className="flex justify-end pt-2">
            <FFButton type="submit" size="lg" className="px-4 h-10" disabled={isSaving || isTesting}>
              {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
              Ayarları Kaydet
            </FFButton>
          </div>
        </Can>
      </form>

      {/* ── Section: Test Mail Gönderim Kutusu ─────────────── */}
      <section className="ff-card bg-[#f0eff2] border border-[#ff4fd8]/30 p-4 md:p-6 space-y-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-[#ff4fd8]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 pb-4 border-b border-[#CCCCCC]">
          <ShieldAlert size={18} className="text-[#ff4fd8]" />
          <div>
            <h2 className="font-display text-lg text-[#333333] font-bold">Bağlantıyı Test Et</h2>
            <p className="text-[10px] text-[#666666]">Yukarıdaki ayarları kaydetmeden de canlı olarak test edebilirsiniz.</p>
          </div>
        </div>

        <Can resource="settings" action="update">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-[11px] font-bold text-[#333333]">Test Alıcı E-postası</label>
              <FFInput
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="alıcı@domain.com"
                className="w-full h-9 bg-transparent border border-[#CCCCCC] focus:border-[#ff4fd8] text-xs text-[#333333] placeholder:text-[#999999]"
              />
            </div>
            <FFButton
              type="button"
              onClick={handleSendTestMail}
              disabled={isSaving || isTesting}
              className="w-full md:w-auto px-6 h-10 bg-[#0A0A0A] hover:bg-[#222222] text-white flex items-center justify-center font-bold text-xs shrink-0"
            >
              {isTesting ? (
                <Loader2 className="animate-spin mr-2" size={14} />
              ) : (
                <Play size={12} className="fill-white mr-2" />
              )}
              Test E-postası Gönder
            </FFButton>
          </div>
        </Can>
      </section>
    </div>
  )
}
