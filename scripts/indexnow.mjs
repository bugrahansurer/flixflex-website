// Sitemap'teki tüm adresleri IndexNow'a bildirir (Bing, Yandex vb.). Google IndexNow kullanmaz.
// Kullanım: node scripts/indexnow.mjs                → sitemap'in tamamı
//           node scripts/indexnow.mjs /yol-1 /yol-2  → yalnızca verilen adresler
const HOST = "flixflex.com.tr"
const KEY = "e4092954754a4611aebb1a319b4970f7"
const args = process.argv.slice(2)
let urls = args.map((p) => `https://${HOST}${p}`)
if (!urls.length) {
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text()
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
})
console.log(`${urls.length} adres gönderildi, yanıt: ${res.status}`)
