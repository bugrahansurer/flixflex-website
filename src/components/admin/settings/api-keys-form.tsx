"use client"

import * as React from "react"
import { FFButton } from "@/components/ui"
import { KeyRound, Plus, Trash2, Copy, Check, Loader2, AlertTriangle } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ApiKeyRow {
  id: string
  name: string
  prefix: string
  scopes: string[]
  isActive: boolean
  lastUsedAt: string | null
  createdAt: string
}

export function ApiKeysForm({ initialKeys }: { initialKeys: ApiKeyRow[] }) {
  const [keys, setKeys] = React.useState<ApiKeyRow[]>(initialKeys)
  const [name, setName] = React.useState("")
  const [creating, setCreating] = React.useState(false)
  const [newKey, setNewKey] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  async function refresh() {
    const res = await fetch("/api/settings/api-keys")
    const data = await res.json()
    if (data.ok) setKeys(data.keys)
  }

  async function createKey() {
    setCreating(true)
    try {
      const res = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Oluşturulamadı")
      setNewKey(data.key)
      setName("")
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata")
    } finally {
      setCreating(false)
    }
  }

  async function revoke(id: string) {
    if (!confirm("Bu anahtar kalıcı olarak iptal edilsin mi? Bu anahtarı kullanan entegrasyonlar çalışmayı durdurur.")) return
    try {
      const res = await fetch(`/api/settings/api-keys/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Silinemedi")
      setKeys((k) => k.filter((x) => x.id !== id))
      toast.success("Anahtar iptal edildi.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata")
    }
  }

  function copyKey() {
    if (!newKey) return
    navigator.clipboard.writeText(newKey).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Create */}
      <div className="ff-shape-container ff-card space-y-4">
        <h3 className="font-display text-sm font-bold text-[#333333]">Yeni Anahtar Oluştur</h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anahtar adı (örn: Mobil Uygulama)"
            className="ff-shape-button flex-1 px-3 py-2.5 text-sm bg-white border border-[#CCCCCC] text-[#333333] placeholder:text-[#999999] outline-none focus:border-[#ff4fd8]"
          />
          <FFButton onClick={createKey} disabled={creating} leftIcon={creating ? <Loader2 className="animate-spin" size={15} /> : <Plus size={15} />}>
            Oluştur
          </FFButton>
        </div>

        {newKey && (
          <div className="ff-shape-container p-4 bg-[var(--warning)]/5 border border-[var(--warning)]/30 space-y-2">
            <div className="flex items-center gap-2 text-[var(--warning)]">
              <AlertTriangle size={14} />
              <span className="text-[12px] font-semibold">Bu anahtar yalnızca bir kez gösterilir — şimdi kopyalayın.</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <code className="flex-1 text-[12px] font-mono text-[#333333] bg-white border border-[#CCCCCC] px-3 py-2 break-all">{newKey}</code>
              <FFButton variant="ghost" onClick={copyKey} leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}>
                {copied ? "Kopyalandı" : "Kopyala"}
              </FFButton>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-2">
        <h3 className="font-display text-sm font-bold text-[#333333] mb-3">Mevcut Anahtarlar</h3>
        {keys.length === 0 ? (
          <p className="text-[13px] text-[#999999] py-6 text-center">Henüz API anahtarı yok.</p>
        ) : (
          keys.map((k) => (
            <div key={k.id} className="ff-shape-container flex items-center justify-between gap-4 p-4 bg-[#F7F7F5] border border-[#CCCCCC]">
              <div className="flex items-center gap-3 min-w-0">
                <span className="ff-shape-button w-9 h-9 flex items-center justify-center bg-[#F0F0F0] text-[var(--ff-purple)] border border-[#CCCCCC] shrink-0">
                  <KeyRound size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#333333] truncate">{k.name}</p>
                  <p className="text-[11px] font-mono text-[#666666]">
                    {k.prefix}…
                    <span className="ml-2 text-[#999999]">
                      {k.lastUsedAt ? `Son kullanım: ${new Date(k.lastUsedAt).toLocaleDateString("tr-TR")}` : "Hiç kullanılmadı"}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => revoke(k.id)}
                className={cn("ff-shape-button p-2 text-[#999999] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors shrink-0")}
                title="İptal et"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>

      <p className="text-[11px] text-[#999999] leading-relaxed">
        Anahtarları isteklerde <code className="font-mono">Authorization: Bearer &lt;anahtar&gt;</code> veya
        <code className="font-mono"> x-api-key</code> başlığıyla kullanın. Yalnızca SHA-256 özeti saklanır.
      </p>
    </div>
  )
}
