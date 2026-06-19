// ═══════════════════════════════════════════════════════════
// FlixFlex Blog — Demo Data
// ═══════════════════════════════════════════════════════════

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  /** Admin-uploaded cover image URL (preferred over coverGradient when set). */
  coverImage?: string | null
  coverGradient: string
  template: "classic" | "editorial" | "visual"
  category: string
  tags: string[]
  author: { name: string; role: string; initials: string }
  readMinutes: number
  publishedAt: string
  featured?: boolean
}

export type BlogCategory = "Tümü" | "Strateji" | "Yaratıcılık" | "Performans" | "SEO" | "Sosyal Medya" | "Marka"

export const BLOG_CATEGORIES: { label: string; value: BlogCategory }[] = [
  { label: "Tümü",         value: "Tümü" },
  { label: "Strateji",     value: "Strateji" },
  { label: "Yaratıcılık",  value: "Yaratıcılık" },
  { label: "Performans",   value: "Performans" },
  { label: "SEO",          value: "SEO" },
  { label: "Sosyal Medya", value: "Sosyal Medya" },
  { label: "Marka",        value: "Marka" },
]

export const POSTS: BlogPost[] = [
  {
    id: "01",
    title: "2026'da Marka Kimliği İnşa Etmek: Görsel Dilden Fazlası",
    slug: "2026-marka-kimligi-insaa-etmek",
    excerpt:
      "Güçlü bir marka kimliği artık sadece logo ve renk paletinden ibaret değil. Ses tonu, hareket dili ve dijital deneyim de bu kimliğin ayrılmaz parçaları.",
    content: `## Marka Artık Bir Duygu

Markalara olan bakış açısı köklü biçimde değişti. Tüketiciler artık yalnızca ürün satın almıyor; **bir yaşam tarzını, bir topluluğu, bir bakış açısını** benimsiyorlar. Bu dönüşüm, marka kimliğini oluşturan unsurların çok daha geniş bir perspektiften ele alınmasını zorunlu kılıyor.

## Görsel Kimliğin Ötesinde

Logo, renk paleti ve tipografi elbette temel taşlar. Ancak 2026'da başarılı markalar bunların çok ötesine geçiyor:

- **Ses tonu ve dil**: Markanın nasıl konuştuğu, ne söylediği kadar önemli
- **Hareket dili**: Animasyon ve mikro-etkileşimler marka kişiliğini yansıtır
- **Dijital deneyim**: Kullanıcının her temas noktasında hissettiği tutarlılık

### Tutarlılık Her Şeydir

> "Bir marka, müşterinin sizin hakkınızda söyledikleridir — siz daha odadan çıkmadan." — Jeff Bezos

Bu tanım, markanın artık tamamen kontrolünüzde olmadığını gösteriyor. Yapabileceğiniz en iyi şey: **tutarlı bir deneyim** sunmak.

## FlixFlex Yaklaşımı

Biz marka kimliğini üç katmanda ele alıyoruz:

### 1. Görsel Katman
Renk, tipografi, ikon sistemi ve görsel gramer. Bunlar zemin oluşturur.

### 2. Ses Katmanı
İçerik tonu, kelime seçimi, empati dili. Markanın "sesi" tüm platformlarda tutarlı olmalı.

### 3. Deneyim Katmanı
Kullanıcının marka ile her temas noktasında yaşadığı his. En soyut ama en güçlü katman.

## Sonuç

**Güçlü marka kimliği inşa etmek bir süreç, bir an değil.** Her gün biraz daha derinleşen, kullanıcıyla büyüyen bir ilişki. FlixFlex olarak bu yolculukta markaların yanında oluyoruz.`,
    coverGradient: "from-[var(--ff-purple)]/30 via-[var(--ff-purple)]/20 to-[var(--foreground)]",
    template: "classic",
    category: "Marka",
    tags: ["marka kimliği", "tasarım", "strateji", "2026"],
    author: { name: "Burak Aydın", role: "Kurucu & Strateji Direktörü", initials: "BA" },
    readMinutes: 6,
    publishedAt: "2026-04-15",
    featured: true,
  },
  {
    id: "02",
    title: "Performans Pazarlamada ROAS'tan Fazlasını Ölçmek",
    slug: "performans-pazarlama-roas-olcumlemek",
    excerpt:
      "ROAS tek başına yeterli değil. Müşteri yaşam boyu değeri, brand lift ve yardımcı dönüşümler hesaba katılmadan verilen kararlar yanıltıcı olabilir.",
    content: `## ROAS Tek Başına Neden Yetersiz?

Dijital reklamcılığın en yaygın metriği ROAS (Return on Ad Spend) uzun yıllar boyunca altın standart olarak kabul edildi. Ancak bu rakam, pazarlama yatırımlarınızın gerçek değerini görmenizi engelleyen **dar bir bakış açısı** sunuyor.

## Gözden Kaçan Metrikler

### Müşteri Yaşam Boyu Değeri (CLV)
Bir dönüşümün anlık değeri değil, o müşterinin uzun vadede üreteceği gelir kritik öneme sahip. **Düşük ROAS'lı ancak yüksek CLV'li** bir segment görmezden gelmek büyük bir kayıp olabilir.

### Brand Lift
Reklam harcamalarının marka bilinirliğine ve algısına katkısı ölçülmeli. Google ve Meta'nın brand lift çalışmaları bu konuda kıymetli veri sağlar.

### Yardımcı Dönüşümler
> "Son tıklama her şeyi almak zorunda değil."

Müşteri yolculuğundaki her temas noktasının değeri var. Sosyal medya farkındalık reklamı son tıklamayı almasa da dönüşümü tetikliyor olabilir.

## Doğru Ölçüm Çerçevesi

- **Birinci ve son tıklama** attribution modellerini karşılaştır
- **Data-driven attribution** modelini dene
- **Incrementality testleri** yap — reklam olmadan ne kadar satardın?
- **MER (Marketing Efficiency Ratio)** hesapla: toplam gelir / toplam pazarlama harcaması

## Sonuç

Performans pazarlamayı doğru değerlendirmek için bütüncül bir çerçeve gerekiyor. FlixFlex olarak müşterilerimize salt ROAS'ın ötesinde **gerçek iş değerini** ortaya koyan raporlama altyapısı kuruyoruz.`,
    coverGradient: "from-[#1A3A6B]/40 via-[#0D2447]/30 to-[#0C0C0C]",
    template: "editorial",
    category: "Performans",
    tags: ["ROAS", "dijital reklamcılık", "attribution", "CLV"],
    author: { name: "Selin Çelik", role: "Performans Pazarlama Uzmanı", initials: "SÇ" },
    readMinutes: 8,
    publishedAt: "2026-04-08",
  },
  {
    id: "03",
    title: "Motion Design: Markanızın Hareket Dilini Oluşturmak",
    slug: "motion-design-marka-hareket-dili",
    excerpt:
      "Statik görsellerin yerini alan motion design, markaların dijital dünyada nasıl 'hareket ettiğini' belirliyor. Doğru hareket dili kullanıcı deneyimini köklü değiştirir.",
    content: `## Neden Hareket Önemli?

İnsan gözü harekete evrimsel olarak programlanmış. Bu yüzden animasyon sadece estetik değil, **dikkat yönetiminin en güçlü aracı**.

## Marka Hareketi Nedir?

Marka hareketi; logo animasyonlarından, UI mikro-etkileşimlerine, sosyal medya içeriklerine kadar uzanan geniş bir yelpazede kendini gösteriyor.

### Temel Prensipler

- **Tutarlılık**: Tüm platformlarda aynı easing ve timing
- **Amaçlılık**: Her animasyonun bir işlevi var
- **Marka uyumu**: Hareket hızı ve karakteri marka kişiliğini yansıtmalı

> "Animasyon, kullanıcıya 'neler olduğunu' anlatmanın en doğal yolu."

## Pratik Uygulama

### Hız ve Easing
Lüks markalar yavaş, akıcı geçişler kullanır. Teknoloji markaları daha keskin, hızlı hareketleri tercih eder. **FlixFlex'in hareketi**: güçlü ve keskin, ama hiçbir zaman kaba.

### Mikro-etkileşimler
Buton hover'ları, form feedback'leri, sayfa geçişleri — bunların hepsi marka dilinin parçası.

## Sonuç

Motion design artık bir "güzel olsun" detayı değil; markanın **temel iletişim aracı**. Doğru yapılandırılmış bir hareket sistemi, kullanıcı güvenini artırır ve marka hatırlanırlığını güçlendirir.`,
    coverGradient: "from-[#FF6B35]/25 via-[#C23616]/20 to-[#0C0C0C]",
    template: "visual",
    category: "Yaratıcılık",
    tags: ["motion design", "animasyon", "UI/UX", "marka"],
    author: { name: "Kerem Yıldız", role: "Kreatif Direktör", initials: "KY" },
    readMinutes: 5,
    publishedAt: "2026-03-28",
  },
  {
    id: "04",
    title: "SEO 2026: AI Arama Çağında Organik Görünürlük",
    slug: "seo-2026-ai-arama-organik-gorunurluk",
    excerpt:
      "Google'ın AI Overview özellikleriyle birlikte SEO stratejileri kökten değişiyor. E-E-A-T sinyalleri, yapılandırılmış veri ve içerik derinliği her zamankinden daha kritik.",
    content: `## AI Aramanın Getirdiği Paradigma Değişimi

2025 ortasında hayatımıza giren AI Overview özelliği, arama sonuç sayfalarını (SERP) köklü biçimde dönüştürdü. Artık kullanıcılar cevapları sayfanıza girmeden alabiliyorlar.

## Ne Değişti?

### Sıfır Tıklama Sorunu
Bazı sorgularda organik trafik dramatik biçimde düştü. Ancak bu her sektör için geçerli değil.

### E-E-A-T'nin Yükselişi
Google'ın **Deneyim, Uzmanlık, Otoriterlik, Güvenilirlik** sinyalleri artık daha ağırlıklı.

> "İçerik üretmek yetmez; o içeriğin arkasında gerçek bir uzman olmalı."

## 2026 SEO Stratejisi

- **Derin içerik**: Yüzeysel bilgi değil, gerçek analiz ve özgün görüş
- **Yapılandırılmış veri**: Schema markup ile AI'ın içeriğinizi anlamasına yardım edin
- **Yazar profili**: Gerçek yazarlar, bio sayfaları, sosyal kanıtlar
- **Güncel içerik**: Tarihi geçmiş bilgiler sıralamadan düşüyor

### Uzun Kuyruklu Kelimeler

Kısa, rekabetçi kelimelerde AI Overview baskın olsa da uzun kuyruklu sorgularda organik sonuçlar hâlâ güçlü.

## Teknik SEO Temelleri

Core Web Vitals hâlâ önemli. LCP < 2.5s, CLS < 0.1, INP < 200ms hedefleri tutturun.

## Sonuç

SEO öldü değil, **evrildi**. Gerçek uzmanlık, güvenilir içerik ve teknik mükemmellik bir araya geldiğinde organik görünürlük hâlâ en değerli trafik kaynağı olmayı sürdürüyor.`,
    coverGradient: "from-[#16A34A]/25 via-[#0D6931]/20 to-[#0C0C0C]",
    template: "editorial",
    category: "SEO",
    tags: ["SEO", "AI arama", "Google", "içerik stratejisi"],
    author: { name: "Ayşe Kaya", role: "SEO & İçerik Stratejisti", initials: "AK" },
    readMinutes: 9,
    publishedAt: "2026-03-20",
  },
  {
    id: "05",
    title: "Sosyal Medya Reklamlarında Creative Testing Nasıl Yapılır?",
    slug: "sosyal-medya-reklam-creative-testing",
    excerpt:
      "Hangi görselin, başlığın veya CTA'nın daha iyi performans göstereceğini tahmin etmek yerine sistematik bir test altyapısı kurmak çok daha güvenilir sonuçlar verir.",
    content: `## Test Kültürü Oluşturmak

En başarılı dijital reklam ekipleri "iyi görünüyor" kararlarını değil, **veri destekli kararları** tercih eder. Bunun temelinde sistematik creative testing yatar.

## Temel Testing Çerçevesi

### A/B Testi vs Multivariate

- **A/B testi**: Tek değişken, net sonuç
- **Multivariate**: Birden fazla değişken, daha fazla bütçe gerektirir

> "İyi bir test hipotezi şöyle başlar: 'Şunu değiştirirsek, şu olur; çünkü...' "

### Test Edilmesi Gereken Öğeler

Öncelik sırasıyla:
- Hook (ilk 3 saniye veya ilk cümle)
- Görsel/Video format
- CTA metni
- Başlık
- Hedef kitle segmentleri

## Test Süreci

### 1. Hipotez Oluştur
Rastgele test etmek değil, bilinçli hipotez kurmak. "Video formatı statik görselden %20 daha fazla dönüşüm getirecek çünkü..."

### 2. Minimum Test Bütçesi
İstatistiksel anlamlılık için yeterli veri lazım. Kural: kafa başına en az 50 dönüşüm.

### 3. Kazananı Ölçeklendir
Test kazananını direkt ölçekleme — önce küçük artışlarla doğrula.

## Creative Fatigue

Kazanan creative'ler er ya da geç yıpranır. **Creative refresh** döngüsü kurmak sürdürülebilir performans için şart.

## Sonuç

Sistematik creative testing, reklamcılığı tahmin oyunundan çıkarıp **öğrenen bir sistem** haline getirir.`,
    coverGradient: "from-[#D97706]/25 via-[#92400E]/20 to-[#0C0C0C]",
    template: "classic",
    category: "Sosyal Medya",
    tags: ["Facebook Ads", "creative testing", "A/B testi", "sosyal medya"],
    author: { name: "Mert Özkan", role: "Paid Social Uzmanı", initials: "MÖ" },
    readMinutes: 7,
    publishedAt: "2026-03-12",
  },
  {
    id: "06",
    title: "B2B Pazarlamada İçerik Stratejisi: Funnel'ın Her Aşaması İçin",
    slug: "b2b-pazarlama-icerik-stratejisi-funnel",
    excerpt:
      "B2B satın alma kararları uzun ve çok paydaşlı. Her funnel aşaması için doğru içerik formatı ve mesajı belirlemek dönüşüm oranlarını dramatik artırır.",
    content: `## B2B İçerik Neden Farklı?

B2C'de duyguya hitap etmek genellikle işe yarar. B2B'de ise karar vericiler **ROI, risk azaltma ve süreç iyileştirme** üzerine odaklanır.

## Funnel Aşamalarına Göre İçerik

### Awareness (Farkındalık)
Potansiyel müşteri henüz sorununun farkında bile olmayabilir.

- Blog yazıları (trend ve problem odaklı)
- LinkedIn thought leadership
- Podcast ve webinar

### Consideration (Değerlendirme)
Müşteri çözüm arıyor ve alternatifleri karşılaştırıyor.

- Vaka çalışmaları (rakamlarla)
- Karşılaştırma rehberleri
- Demo videolar

> "Karar vericinin 'neden siz?' sorusuna net cevap verin."

### Decision (Karar)
Alım kararına yaklaşmış, güven arayışında.

- ROI hesaplama araçları
- Referans müşteriler
- Ücretsiz deneme / pilot teklif

## Ölçüm

Her aşama için farklı metrikler:
- Awareness: Reach, brand search artışı
- Consideration: Sayfa ziyaretleri, içerik indirme
- Decision: Demo talepleri, teklif istekleri

## Sonuç

B2B içerik stratejisi bir mara ton koşusu. Kısa vadeli kazanım değil, uzun vadeli güven inşası. Doğru yapılandırıldığında ise en yüksek ROI'lu pazarlama kanalına dönüşür.`,
    coverGradient: "from-[#0EA5E9]/25 via-[#0369A1]/20 to-[#0C0C0C]",
    template: "editorial",
    category: "Strateji",
    tags: ["B2B", "içerik pazarlama", "funnel", "lead generation"],
    author: { name: "Burak Aydın", role: "Kurucu & Strateji Direktörü", initials: "BA" },
    readMinutes: 8,
    publishedAt: "2026-03-05",
  },
  {
    id: "07",
    title: "TikTok ve Reels ile Viral İçerik: Algoritmanın Gerçek Yüzü",
    slug: "tiktok-reels-viral-icerik-algoritma",
    excerpt:
      "Viral olmak şansa bağlı değil. TikTok ve Reels algoritmalarının önceliklendirdiği sinyalleri anlayan markalar organik erişimde rakiplerini geçiyor.",
    content: `## Algoritmayı Anlamak

TikTok ve Instagram Reels algoritmaları, takipçi sayısından bağımsız olarak **içerik kalitesini ve engagement'ı** ön plana çıkaran dağıtım modellerine sahip.

## TikTok Algoritmasının Temel Sinyalleri

### Completion Rate
Videonun sonuna kadar izlenme oranı en güçlü sinyal. İlk 3 saniye hook'u hayati önem taşıyor.

### Re-watch Oranı
Kullanıcı videoyu tekrar izledi mi? Bu, içeriğin değerli olduğunu gösterir.

### Engage Hızı
> "İlk 30 dakikadaki engagement, algoritmanın içeriği geniş kitleye açmasında belirleyici."

## Viral Format Reçetesi

Algoritmanın sevdiği formatlar:
- Problem → Çözüm yapısı
- "Bilmediğiniz şu..." ile başlayan içerikler
- Beklenmedik twist'ler
- Eğitici içerik (öğretilebilecek bir şey)

### Hook Teknikleri

- Soru ile başla: "Neden markalar bu hatayı yapıyor?"
- İddia ile başla: "3 ayda 50.000 takipçi kazandık ve işte nasıl..."
- Görsel shock: İlk karede dikkat çeken bir görsel

## Marka İçerikleri için Öneriler

- **%80 değer, %20 tanıtım** kuralı
- Trend ses ve formatları erken yakala
- Sahne arkası ve gerçeklik unsurları ekle

## Sonuç

Viral olmak tesadüf değil, **sistematik bir formülün** uygulanması. Algoritmanın dilini konuşan markalar organik erişimde büyük avantaj elde ediyor.`,
    coverGradient: "from-[#EC4899]/25 via-[#9D174D]/20 to-[#0C0C0C]",
    template: "visual",
    category: "Sosyal Medya",
    tags: ["TikTok", "Reels", "viral", "organik erişim"],
    author: { name: "Zeynep Arslan", role: "Sosyal Medya Stratejisti", initials: "ZA" },
    readMinutes: 6,
    publishedAt: "2026-02-25",
  },
  {
    id: "08",
    title: "Dönüşüm Odaklı Landing Page Tasarımının 7 Prensibi",
    slug: "donusum-odakli-landing-page-tasarimi",
    excerpt:
      "Ziyaretçiyi müşteriye dönüştüren landing page'ler şans eseri ortaya çıkmaz. Kanıtlanmış tasarım prensipleri ile dönüşüm oranlarınızı iki katına çıkarabilirsiniz.",
    content: `## Dönüşüm Tasarımı Nedir?

Her tasarım kararının bir hedefi var: kullanıcıyı istenen eyleme yönlendirmek. Dönüşüm odaklı tasarım, estetik ile işlevselliği **bilinçli bir şekilde birleştiriyor**.

## 7 Temel Prensip

### 1. Tek Bir Mesaj
Landing page'inizde tek bir mesaj, tek bir CTA. Dikkat dağıtmayın.

### 2. Hiyerarşik Görsel Akış
Göz doğal olarak F veya Z pattern'ını izler. Kritik bilgilerinizi bu akışa yerleştirin.

### 3. Sosyal Kanıt
> "Kullanıcılar ne yapacaklarına karar verirken başkalarının ne yaptığına bakıyor."

Logo duvarı, referanslar, sayılar — hepsinin yeri var.

### 4. Sürtünmeyi Azalt
Form alanlarını minimuma indir. Her ekstra alan dönüşümü düşürür. İspat: Hubspot verilerine göre 4 alanlı formlar 3 alanlıdan %50 daha az dönüşüm getiriyor.

### 5. Hız
Bir saniye gecikme, dönüşümü %7 düşürüyor. Core Web Vitals hedeflerinizi tutturun.

### 6. CTA Tasarımı
- Yüksek kontrast
- Aksiyon fiili kullanın: "Başla", "İndir", "Ücretsiz Dene"
- Tekrar edin — özellikle uzun sayfalarda

### 7. Trust Signals
SSL, ödeme güvenliği ikonları, para-iade garantisi. Kullanıcı güveni olmadan dönüşüm olmaz.

## Test Etmeden Olmaz

Bu prensipler başlangıç noktası. Gerçek optimizasyon A/B testleriyle gelir.

## Sonuç

Dönüşüm tasarımı bilim ve sanatın kesişimi. **Her piksel bir amaca hizmet etmeli.**`,
    coverGradient: "from-[#7C3AED]/30 via-[#4C1D95]/20 to-[#0C0C0C]",
    template: "classic",
    category: "Performans",
    tags: ["CRO", "landing page", "UX", "dönüşüm"],
    author: { name: "Kerem Yıldız", role: "Kreatif Direktör", initials: "KY" },
    readMinutes: 7,
    publishedAt: "2026-02-17",
  },
  {
    id: "09",
    title: "Google Ads'da Akıllı Teklif Stratejileri: Ne Zaman Ne Kullanmalı?",
    slug: "google-ads-akilli-teklif-stratejileri",
    excerpt:
      "Manual CPC'den tCPA'ya, tROAS'tan Maximize Conversions'a — Google'ın akıllı teklif stratejileri doğru kullanıldığında kampanya performansını katlar, yanlış kullanıldığında bütçeyi eritir.",
    content: `## Smart Bidding'in Temeli

Google'ın akıllı teklif stratejileri, gerçek zamanlı olarak **milyarlarca sinyal** işleyerek her açık arttırmada en uygun teklifi belirliyor. Cihaz, konum, saat, tarayıcı geçmişi ve çok daha fazlası hesaba katılıyor.

## Strateji Rehberi

### Manual CPC
Ne zaman kullan: Yeni hesap, az dönüşüm verisi, tam kontrol istiyorsunuz.
Dezavantaj: Zaman alıcı, ölçeklenemiyor.

### Maximize Clicks
Ne zaman kullan: Sadece trafik hedefliyorsunuz, dönüşüm takibiniz yok.

### Maximize Conversions
> "Bütçenizi tamamen tüketirken en fazla dönüşümü almaya çalışır."

Ne zaman kullan: Hedef CPA'nız yok ama maksimum dönüşüm istiyorsunuz.

### tCPA (Hedef EBM)
En güçlü strateji. Ancak çalışması için:
- En az 30-50 dönüşüm/ay gerekiyor
- Dönüşüm değerleri optimize edilmiş olmalı

### tROAS
E-ticaret için ideal. Farklı ürünlerin farklı marjlarını hesaba katar.

## Geçiş Stratejisi

Manual'dan Smart Bidding'e geçiş her zaman dikkatli yapılmalı:
- Önce küçük bir kampanya/segment ile test et
- İlk 2-4 hafta "öğrenme dönemi" — performans düşebilir
- Hedef CPA'yı mevcut performansınızın %10-15 üstünde başlat

## Önemli Uyarılar

Smart Bidding sihirli değnek değil. Düşük kaliteli dönüşüm takibi, yetersiz veri veya hatalı hedefler stratejiyi mahvedebilir.

## Sonuç

Doğru teklif stratejisi, hesabın olgunluk seviyesine ve hedeflerine bağlı. **Veriyle desteklenmiş kararlar** her zaman kazanır.`,
    coverGradient: "from-[#2563EB]/25 via-[#1D4ED8]/20 to-[#0C0C0C]",
    template: "editorial",
    category: "Performans",
    tags: ["Google Ads", "Smart Bidding", "tCPA", "tROAS", "PPC"],
    author: { name: "Selin Çelik", role: "Performans Pazarlama Uzmanı", initials: "SÇ" },
    readMinutes: 10,
    publishedAt: "2026-02-10",
  },
  {
    id: "10",
    title: "Rebranding Sürecinde Yapılan 5 Büyük Hata",
    slug: "rebranding-surecinde-yapilan-hatalar",
    excerpt:
      "Rebranding bir markanın en kritik kararlarından biri. Yanlış zamanlama, eksik araştırma veya yönetilemeyen iletişim süreci, milyonlarca dolarlık yatırımı çöpe çevirebilir.",
    content: `## Rebranding Neden Bu Kadar Riskli?

Marka, yıllar içinde inşa edilmiş güven ve tanınırlık birikimi. Rebranding bu birikimi hem koruyup güncelleyebilir, hem de yıkabilir. **Gap'in 2010 ve Tropicana'nın 2009 rebranding felaketleri** bunun en çarpıcı örnekleri.

## 5 Kritik Hata

### 1. Kullanıcı Araştırması Yapmamak
Marka yöneticilerinin ne istediği değil, **müşterilerin markayı nasıl algıladığı** önemli. Araştırmasız rebranding kördür.

### 2. Mevcut Kullanıcıları Yabancılaştırmak
Sadık müşteriler genellikle yeni tasarıma direnir. Bu direnci yönetmek stratejinin parçası olmalı.

> "Değişim iletişimi, değişim tasarımı kadar önemli."

### 3. İç Paydaşları Dahil Etmemek
Çalışanlar markanın ilk savunucuları. Rebranding öncesinde iç iletişim ve katılım şart.

### 4. Dijital Varlıkları Güncellememek
Logo değişirken sosyal medya profilleri, favicon, e-posta imzaları atlanıyor. Tutarsızlık güveni zedeler.

### 5. Çok Hızlı Davranmak
Rebranding bir sprint değil, **uzun soluklu bir proje**. Aceleyle yapılan rebranding'ler yarım kalır.

## Başarılı Rebranding Formülü

- Kapsamlı pazar ve kullanıcı araştırması
- Net rebranding gerekçesi ve hedefleri
- Paydaş yönetim planı
- Fazlı lansman stratejisi
- Performans ölçüm çerçevesi

## Sonuç

Rebranding doğru yapıldığında markayı yeniden hayata geçirebilir. Yanlış yapıldığında ise geri dönüşü zor hasarlara yol açar. **Her karar veride, her adım stratejide olmalı.**`,
    coverGradient: "from-[#DC2626]/20 via-[#7F1D1D]/20 to-[#0C0C0C]",
    template: "visual",
    category: "Marka",
    tags: ["rebranding", "marka stratejisi", "kurumsal kimlik"],
    author: { name: "Burak Aydın", role: "Kurucu & Strateji Direktörü", initials: "BA" },
    readMinutes: 6,
    publishedAt: "2026-02-03",
  },
  {
    id: "11",
    title: "E-posta Pazarlamasında Otomasyon: Açılış Oranını 3 Katına Çıkaran Taktikler",
    slug: "eposta-pazarlama-otomasyon-taktikler",
    excerpt:
      "E-posta listesi hâlâ en değerli dijital varlıklardan biri. Doğru segmentasyon ve otomasyon akışları ile e-posta pazarlaması rakipsiz ROI sunuyor.",
    content: `## E-posta Neden Hâlâ Kral?

Sosyal medya algoritmalarının öngörülemezliğine karşın e-posta listesi **size ait bir kanal**. Platformlar değişse de, listeniz kalıcı.

## Otomasyon Akışlarının Gücü

### Welcome Serisi
Yeni aboneye gönderilen ilk e-postalar en yüksek açılış oranına sahip. Bunu boşa harcamayın.

- E-posta 1: Sıcak karşılama + en değerli içerik
- E-posta 2 (3 gün sonra): Sorununuzu anlıyoruz
- E-posta 3 (7 gün sonra): Sosyal kanıt + hafif CTA

### Abandon Cart (Sepet Terk)
E-ticaret için olmazsa olmaz. İlk saatte gönderilen e-posta %40+ açılış oranı yakalıyor.

> "Zamanlama her şey. Doğru anda doğru mesaj gönder."

### Re-engagement Serisi
90 gün boyunca etkileşim kurmayan abonelere özel kampanya.

## Segmentasyon Teknikleri

- **Davranış tabanlı**: Ne tıklıyor, ne okuyor?
- **Satın alma geçmişi**: Ne aldı, ne kadar sıklıkla?
- **Aşama tabanlı**: Lifecycle içinde nerede?

### Kişiselleştirme

İsim kullanmak eski kişiselleştirme. Gerçek kişiselleştirme:
- Ürün önerileri (geçmiş davranış)
- Gönderim zamanı optimizasyonu (kişiye özel saat)
- Dinamik içerik blokları

## Ölçüm

- Açılış oranı: >25% iyi, >35% mükemmel
- Tıklama oranı: >3% iyi
- Gelir başına e-posta değeri takip edin

## Sonuç

E-posta otomasyonu, **bir kez kurulup sürekli gelir üreten** bir makine. Yatırım yapmaya değer.`,
    coverGradient: "from-[#059669]/25 via-[#065F46]/20 to-[#0C0C0C]",
    template: "classic",
    category: "Strateji",
    tags: ["e-posta pazarlama", "otomasyon", "segmentasyon", "CRM"],
    author: { name: "Ayşe Kaya", role: "SEO & İçerik Stratejisti", initials: "AK" },
    readMinutes: 8,
    publishedAt: "2026-01-27",
  },
  {
    id: "12",
    title: "Influencer Marketing 2026: Micro ve Nano'nun Yükselişi",
    slug: "influencer-marketing-2026-micro-nano",
    excerpt:
      "Mega influencer'ların erişimi büyük ama güven düşük. Micro ve nano influencer'lar ise niş kitlelerinde güçlü etki yaratıyor ve marka için çok daha yüksek ROAS sunuyor.",
    content: `## Influencer Pazarlamanın Olgunlaşması

İlk yıllarda her şey erişim (reach) üzerineydi. Şimdi ise **güven, niş uyum ve otantiklik** belirleyici.

## Influencer Kategorileri

- **Nano**: 1K-10K takipçi — En yüksek engagement oranı
- **Micro**: 10K-100K — Güvenilirlik + erişim dengesi
- **Macro**: 100K-1M — Bilinirlik için güçlü
- **Mega**: 1M+ — En düşük engagement, en yüksek maliyet

## Neden Micro ve Nano Kazanıyor?

Küçük influencer'ların topluluklarıyla **gerçek bir bağı** var. Takipçileri önerilerini reklamdan çok bir arkadaş tavsiyesi gibi algılıyor.

> "10.000 kişiye %8 engagement, 1 milyon kişiye %0.5 engagement'tan daha değerlidir."

## Seçim Kriterleri

- Gerçek engagement oranı (bot kontrolü yapın)
- Kitle demografisi ile hedef kitlenizin örtüşmesi
- İçerik kalitesi ve tutarlılığı
- Marka değerleriyle uyum

## Kampanya Yönetimi

### Brief Hazırlama
Kısıtlayıcı değil, **yol gösterici** brief'ler. Influencer'ın sesini boğmayın.

### Ölçüm
- Branded search artışı
- Discount code kullanımı
- Affiliate link tıklaması
- Story swipe-up

## 2026'daki Trend

AI araçları influencer bulma ve takibi kolaylaştırıyor. Ancak **insan değerlendirmesi** hâlâ şart.

## Sonuç

Doğru influencer stratejisi, büyük bütçe değil **doğru eşleşme** gerektiriyor. Micro ve nano segmentte gizli güç var.`,
    coverGradient: "from-[#F59E0B]/25 via-[#B45309]/20 to-[#0C0C0C]",
    template: "visual",
    category: "Sosyal Medya",
    tags: ["influencer", "micro influencer", "sosyal medya", "UGC"],
    author: { name: "Zeynep Arslan", role: "Sosyal Medya Stratejisti", initials: "ZA" },
    readMinutes: 6,
    publishedAt: "2026-01-20",
  },
]

// ── Helper functions ──────────────────────────────────────

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug)
}

export function getFeaturedPost(): BlogPost {
  return POSTS.find((p) => p.featured) ?? POSTS[0]
}

export function getRelatedPosts(slug: string, n = 3): BlogPost[] {
  const post = getPost(slug)
  if (!post) return POSTS.slice(0, n)

  // same category first, then fill with others
  const sameCategory = POSTS.filter(
    (p) => p.slug !== slug && p.category === post.category
  )
  const others = POSTS.filter(
    (p) => p.slug !== slug && p.category !== post.category
  )
  return [...sameCategory, ...others].slice(0, n)
}

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  if (category === "Tümü") return POSTS
  return POSTS.filter((p) => p.category === category)
}
