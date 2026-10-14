// ═══════════════════════════════════════════════════════════
// Medya yükleme — tarayıcı tarafı yardımcı
// Küçük görseller (≤4 MB) /api/media/upload üzerinden (sunucuda
// WebP'ye sıkıştırılır); video ve büyük dosyalar imzalı URL ile
// doğrudan R2'ye, ardından /api/media/upload-complete.
// ═══════════════════════════════════════════════════════════

/** Sunucudan geçen yüklemelerin sınırı (lib/media-upload ile aynı). */
const MAX_SERVER_UPLOAD_BYTES = 4 * 1024 * 1024

export interface UploadedMedia {
  id: string
  url: string
  title: string | null
  type: string
  [key: string]: unknown
}

interface UploadOptions {
  folderId?: string | null
  /** 0–1 arası ilerleme (yalnızca doğrudan R2 yüklemelerinde). */
  onProgress?: (fraction: number) => void
}

async function readJson(res: Response) {
  return res.json().catch(() => null) as Promise<{ error?: string; data?: UploadedMedia; [k: string]: unknown } | null>
}

/** Videonun boyut/süre bilgisini tarayıcıda okur; okunamazsa boş döner. */
function readVideoMeta(file: File): Promise<{ width?: number; height?: number; duration?: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const v = document.createElement("video")
    const done = (meta: { width?: number; height?: number; duration?: number }) => {
      URL.revokeObjectURL(url)
      resolve(meta)
    }
    v.preload = "metadata"
    v.muted = true
    v.onloadedmetadata = () =>
      done({
        width: v.videoWidth || undefined,
        height: v.videoHeight || undefined,
        duration: Number.isFinite(v.duration) && v.duration > 0 ? v.duration : undefined,
      })
    v.onerror = () => done({})
    setTimeout(() => done({}), 10_000)
    v.src = url
  })
}

/** XHR ile PUT — fetch yükleme ilerlemesi vermediği için. */
function putWithProgress(url: string, file: File, onProgress?: (f: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url)
    xhr.setRequestHeader("Content-Type", file.type)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total)
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Depolamaya yükleme başarısız (${xhr.status})`))
    xhr.onerror = () => reject(new Error("Depolamaya bağlanılamadı"))
    xhr.send(file)
  })
}

export async function uploadMediaFile(file: File, opts: UploadOptions = {}): Promise<UploadedMedia> {
  const folderId = opts.folderId ?? null

  // Küçük görsel → sunucu üzerinden (sıkıştırma + tek istek)
  if (file.type.startsWith("image/") && file.size <= MAX_SERVER_UPLOAD_BYTES) {
    const formData = new FormData()
    formData.append("file", file)
    if (folderId) formData.append("folderId", folderId)
    const res = await fetch("/api/media/upload", { method: "POST", body: formData })
    const json = await readJson(res)
    if (!res.ok || !json?.data) throw new Error(json?.error || "Dosya yüklenemedi")
    return json.data
  }

  // Büyük dosya / video → imzalı URL ile doğrudan R2
  const prep = await fetch("/api/media/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size }),
  })
  const prepJson = await readJson(prep)
  if (!prep.ok || typeof prepJson?.uploadUrl !== "string") {
    throw new Error(prepJson?.error || "Yükleme hazırlığı başarısız oldu")
  }

  const [meta] = await Promise.all([
    file.type.startsWith("video/") ? readVideoMeta(file) : Promise.resolve({}),
    putWithProgress(prepJson.uploadUrl, file, opts.onProgress),
  ])

  const done = await fetch("/api/media/upload-complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: prepJson.key, title: file.name, folderId, ...meta }),
  })
  const doneJson = await readJson(done)
  if (!done.ok || !doneJson?.data) throw new Error(doneJson?.error || "Yükleme tamamlanamadı")
  return doneJson.data
}
