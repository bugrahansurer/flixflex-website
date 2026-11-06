// ═══════════════════════════════════════════════════════════
// Hizmet sayfalarının alt kısmındaki uzun içerik + SSS.
// Semrush SEO Writing Assistant önerilerine göre yazıldı (Kasım 2026):
// hedef kelimeler ve ilgili kelimeler metne doğal şekilde yerleştirildi.
// Paragraflardaki [metin](/yol) biçimi iç linke dönüşür.
// ═══════════════════════════════════════════════════════════

export interface ServiceGuideSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export interface ServiceGuide {
  /** Sayfa <title> ve meta açıklaması; admin'deki değerlerin önüne geçer */
  seoTitle?: string
  seoDescription?: string
  /** Sayfanın görünen ana başlığı; yoksa admin'deki hizmet adı kullanılır */
  h1?: string
  eyebrow: string
  sections: ServiceGuideSection[]
  faqs: { q: string; a: string }[]
}

export const SERVICE_GUIDES: Record<string, ServiceGuide> = {
  // ── Sosyal medya yönetimi ─────────────────────────────────
  "sosyal-medya-yonetimi": {
    seoTitle: "Sosyal Medya Yönetimi ve Sosyal Medya Ajansı Hizmeti",
    seoDescription:
      "Profesyonel sosyal medya yönetimi: içerik takvimi, Reels ve tasarım üretimi, hesap yönetimi ve Meta reklamları tek ekipte. Mersin merkezli sosyal medya ajansı FlixFlex.",
    h1: "Sosyal Medya Yönetimi ve Sosyal Medya Ajansı",
    eyebrow: "Sosyal Medya Yönetimi Rehberi",
    sections: [
      {
        heading: "Sosyal medya yönetimi nedir, işletmenize ne kazandırır?",
        paragraphs: [
          "Sosyal medya yönetimi, markanızın Instagram, TikTok, Facebook ve LinkedIn hesaplarının bir plana göre yürütülmesidir. İçerik takvimi, içerik üretimi, paylaşım, yorum ve mesaj takibi, reklam desteği ve aylık analiz bu işin parçalarıdır. Amaç sadece düzenli paylaşım yapmak değil, doğru kitleye ulaşıp takipçiyi müşteriye çevirmektir.",
          "FlixFlex olarak Tarsus merkezli ekibimizle Mersin, Adana ve Türkiye genelindeki markalara profesyonel sosyal medya yönetimi hizmeti veriyoruz. Her hesabı hazır şablonla değil, markanın hedefine göre kurulan bir sosyal medya stratejisiyle yönetiyoruz.",
        ],
      },
      {
        heading: "Sosyal medya yönetimi hizmetimize neler dahil?",
        bullets: [
          "Sosyal medya stratejisi: hedef kitle, rakip ve marka analiziyle hangi platformda, hangi mesajla ve ne sıklıkla görüneceğinizi belirliyoruz.",
          "İçerik takvimi: her ayın paylaşımlarını önceden planlayıp onayınıza sunuyoruz. Kampanyalar ve özel günler takvime baştan işlenir.",
          "İçerik üretimi: tasarım, carousel, Reels ve hikâye içerikleri, motion design videolar ve metinler ekibimizden çıkar.",
          "Sosyal medya hesap yönetimi: paylaşım, profil düzeni, öne çıkanlar, yorum ve mesaj takibi.",
          "Reklam yönetimi desteği: iyi performans gösteren içerikleri Meta reklamlarıyla doğru hedef kitleye ulaştırıyoruz.",
          "Raporlama: aylık PDF yerine canlı veriyle hangi içeriğin işe yaradığını gösteriyoruz.",
        ],
      },
      {
        heading: "Profesyonel sosyal medya yönetimi nasıl işler?",
        paragraphs: [
          "İlk görüşmede markanızı, satış hedeflerinizi ve bugüne kadarki paylaşımlarınızı inceliyoruz. Ardından 30 günlük içerik planını hazırlıyoruz. Plan onaylanınca içerik oluşturma başlar, yayın saatleri hedef kitlenizin en aktif olduğu zamanlara göre ayarlanır.",
          "Ay sonunda hangi içeriklerin etkileşim, profil ziyareti ve mesaj getirdiğine bakıyor, bir sonraki ayın planını buna göre güncelliyoruz. Sosyal medya yönetimi bir kerelik iş değil. Etkili bir şekilde büyümek için düzenli ölçüm ve küçük düzeltmeler gerekir.",
        ],
      },
      {
        heading: "Sosyal medya ajansı ile çalışmanın farkı",
        paragraphs: [
          "Sosyal medya hesaplarını işletmenin içinden biri de yönetebilir. Fark şurada ortaya çıkar: bir sosyal medya ajansı strateji, tasarım, video, metin ve dijital pazarlama bilgisini tek ekipte toplar. Böylece içerik üretimi ile reklam kampanyalarının sonuçları birbirinden kopmaz.",
        ],
        bullets: [
          "Hazır şablon yok. Her markanın içerik dili ve görsel kimliği ayrı kurulur.",
          "Canlı veri. Hangi paylaşımın satış ya da mesaj getirdiğini ay sonunu beklemeden görürsünüz.",
          "Hızlı dönüş. Sorularınıza e-posta zinciri yerine aynı gün cevap veririz.",
          "Yazılı taahhüt. Söz verdiğimiz işi zamanında teslim etmezsek o ayın ücretini almayız.",
        ],
      },
      {
        heading: "Sosyal medya ajansı seçerken nelere bakmalısınız?",
        paragraphs: [
          "Sosyal medya ajansları arasında seçim yaparken fiyat tek ölçü olmamalı. Aynı fiyata biri hazır şablon gönderirken diğeri strateji, video ve reklamı birlikte yürütebilir. Markanın ihtiyacına göre kurulmuş bir plan görmek için teklif aşamasında şu soruları sorun.",
        ],
        bullets: [
          "Daha önce benzer sektörde iş yaptınız mı, örneklerini görebilir miyim?",
          "İçerikleri kim üretiyor, ajansın kendi ekibi mi yoksa dış kaynak mı?",
          "Hangi rakamları paylaşacaksınız? Takipçi sayısı tek başına yeterli değildir.",
          "Reklam hesabı ve sosyal medya hesapları kimin adına olacak? Cevap her zaman işletmeniz olmalıdır.",
          "Dijital medya planlama yapıyor musunuz? Yani içerik ve reklam bütçesi birlikte mi planlanıyor?",
        ],
      },
      {
        heading: "Hangi sektörlerde sosyal medya yönetimi yapıyoruz?",
        paragraphs: [
          "Sosyal medya ajansı olarak markalara sektörlerine göre farklı bir plan kuruyoruz. Bir kuruyemiş markası için ürün videosu ve kampanya öne çıkarken, bir enerji şirketinde kurumsal dil ve güven önemlidir. Bir restoranda ise mekânın atmosferi ve konum bilgisi işi götürür.",
        ],
        bullets: [
          "E-ticaret markaları: ürün tanıtımı, kampanya takvimi ve reklamla desteklenen içerikler.",
          "Yeme içme ve eğlence: mekân, menü ve etkinlik içerikleri. Jozi Pub Bahçeli bunun örneklerinden biri.",
          "Kurumsal şirketler: LinkedIn, işveren markası ve sektör içerikleri.",
          "Spor kulüpleri: maç günü ve kadro tasarımları. Bursaspor Basketbol için sosyal medya tasarımları hazırladık.",
        ],
      },
      {
        heading: "Hangi platformlarda sosyal medya yönetimi yapıyoruz?",
        paragraphs: [
          "Instagram çoğu marka için ana kanaldır. Reels, carousel ve hikâyelerle hem yeni kitleye ulaşmayı hem mevcut takipçiyle bağ kurmayı birlikte planlıyoruz. TikTok'ta kısa video içeriklerin ilk saniyesine odaklanıyor, Facebook'u özellikle yerel kitleler ve reklamlar için kullanıyoruz. B2B markalarda LinkedIn şirket sayfası yönetimini de üstleniyoruz.",
          "Her platformu aynı içerikle doldurmuyoruz. Markaların sosyal medya platformlarında farklı dillerle konuşması gerekir; bir Reels ile bir LinkedIn gönderisi aynı mesajı farklı biçimde anlatır.",
        ],
      },
      {
        heading: "Sosyal medya içerik üretimi: hangi içerikler işe yarar?",
        paragraphs: [
          "Algoritma her yıl değişse de değişmeyen bir şey var: insanlar kaydırmayı durduran, işine yarayan ya da onu eğlendiren içeriğe kalıyor. Bu yüzden içerik üretimini üç soru üzerine kuruyoruz. İlk saniyede dikkat çekiyor mu, izleyene bir şey öğretiyor ya da hissettiriyor mu, sonunda ne yapması gerektiğini söylüyor mu?",
        ],
        bullets: [
          "Reels ve kısa videolar: yeni kitleye ulaşmanın en hızlı yolu. Ürünü kullanırken, sorunu çözerken ya da önce-sonra karşılaştırmasıyla gösteren videolar öne çıkar.",
          "Carousel gönderiler: bilgi veren, kaydedilen ve paylaşılan içerikler. Rehberler, karşılaştırmalar ve kısa listeler için idealdir.",
          "Hikâyeler: mevcut takipçiyle günlük bağ kurmak, kampanya duyurmak ve anket ya da soru kutusuyla geri bildirim almak için.",
          "Müşteri içerikleri: gerçek müşteri yorumları ve kullanıcıların çektiği içerikler güveni reklamdan daha hızlı artırır.",
          "Motion design: ürün ve hizmeti kısa, hareketli grafiklerle anlatan videolar. Ekibimizin en güçlü olduğu alanlardan biri.",
        ],
      },
      {
        heading: "Sosyal medya hesaplarını büyütmenin temel kuralları",
        bullets: [
          "Düzenli paylaşım: haftada 3 iyi içerik, haftada 10 aceleyle hazırlanmış içerikten daha çok işe yarar. Önemli olan ritmi bozmamaktır.",
          "Tek mesaj: her paylaşım tek bir fikri anlatmalı. Kalabalık tasarım ve uzun metin kaydırılıp geçilir.",
          "Hedef kitleye göre dil: genç bir kitleyle kurumsal bir alıcıyla aynı tonda konuşulmaz.",
          "Etkileşime cevap: yorum ve mesajlara hızlı dönmek hem algoritmaya hem müşteriye iyi sinyal verir.",
          "Ölç ve düzelt: en çok kaydedilen, paylaşılan ve mesaj getiren içerik türlerini çoğaltıp çalışmayanları bırakmak.",
        ],
      },
      {
        heading: "Sosyal medya yönetimi ve reklam yönetimi birlikte nasıl çalışır?",
        paragraphs: [
          "Organik paylaşımlar mevcut takipçilerinize ulaşır, reklamlar ise henüz sizi tanımayan potansiyel müşterilere. İkisini ayrı ekiplere vermek çoğu zaman aynı bütçenin iki kez harcanması demektir. Biz organik içeriklerden hangisinin daha çok etkileşim aldığını görüp en iyi performans gösteren içerikleri reklamla büyütüyoruz.",
          "Sosyal medya reklamlarının dili de organik içerikle uyumlu olur. Böylece reklamı görüp profile gelen kişi tutarlı bir marka görür. Reklam tarafında neler yaptığımızı [Meta ve TikTok Reklamları](/hizmetler/meta-tiktok-reklamlari) sayfamızda anlattık.",
        ],
      },
      {
        heading: "Kurumsal sosyal medya yönetimi",
        paragraphs: [
          "Birden fazla departmanı, onay süreci ve marka rehberi olan şirketler için sosyal medya yönetimini daha sıkı bir düzenle yürütüyoruz. İçerik takvimi ilgili kişilerin onayından geçer, marka dili ve görsel kurallar yazılı hale getirilir, kriz anlarında nasıl cevap verileceği önceden belirlenir.",
          "LinkedIn şirket sayfası, işveren markası içerikleri ve sektör etkinlikleri kurumsal hesapların öne çıkan başlıklarıdır. Mysan Grup Enerji gibi kurumsal markalarda kimlik ve sosyal medyayı birlikte kurguladık.",
        ],
      },
      {
        heading: "Sosyal medya yönetimi fiyatları neye göre belirlenir?",
        paragraphs: [
          "Fiyatı belirleyen başlıca etkenler yönetilen platform sayısı, aylık içerik adedi, video içeriklerin oranı, reklam yönetiminin pakete dahil olup olmadığı ve çalışma süresidir. Aylık, 3, 6 ve 12 aylık paketlerle çalışıyoruz. Uzun süreli paketlerde aylık maliyet düşer.",
          "Güncel fiyat aralıklarını ve paketlerin neleri kapsadığını [Sosyal Medya Yönetimi Fiyatları 2026](/blog/sosyal-medya-yonetimi-fiyatlari-2026) yazımızda bulabilirsiniz.",
        ],
      },
      {
        heading: "Mersin ve Tarsus'ta sosyal medya yönetimi",
        paragraphs: [
          "Tarsus merkezli ekibimiz Mersin, Tarsus, Mezitli, Yenişehir ve Adana'daki işletmelerle çalışıyor. Yerel bir restoranın, mağazanın ya da e-ticaret markasının hedef kitlesini bölgeyi tanıyarak planlamak, potansiyel müşterilere daha doğru içerikle ulaşmayı sağlar. Türkiye'nin diğer şehirlerindeki markalarla süreci tamamen online yürütüyoruz. Ayrıntılar için [Mersin Sosyal Medya Ajansı](/mersin-sosyal-medya-ajansi) sayfamıza göz atın.",
        ],
      },
    ],
    faqs: [
      {
        q: "Sosyal medya yönetimi ne kadar sürede sonuç verir?",
        a: "İlk ayda hesap düzeni, içerik dili ve paylaşım ritmi oturur. Etkileşim ve takipçi artışı genellikle ikinci ve üçüncü ayda belirginleşir. Hızlı satış hedefiniz varsa içerikleri reklamla desteklemeyi öneririz. Sonuçlar sektöre ve bütçeye göre değiştiği için kesin rakam vaat etmiyoruz.",
      },
      {
        q: "İçerikleri kim üretiyor, onay süreci nasıl işliyor?",
        a: "Tasarım, video ve metinlerin tamamını ekibimiz üretir. Her ayın içerik planı yayından önce onayınıza gelir, istediğiniz değişiklikleri yapıp öyle yayınlarız.",
      },
      {
        q: "Sadece Instagram yönetimi alabilir miyim?",
        a: "Evet. Tek platformla başlayıp sonuçları gördükçe TikTok, Facebook ya da LinkedIn'i ekleyebilirsiniz.",
      },
      {
        q: "Reklam bütçesi sosyal medya yönetimi ücretine dahil mi?",
        a: "Hayır. Reklam bütçesi doğrudan Meta'ya ödenir. Reklam yönetimini pakete ekleyebilir ya da ayrı bir hizmet olarak alabilirsiniz.",
      },
      {
        q: "Sözleşme süresi ne kadar?",
        a: "Aylık, 3, 6 ve 12 aylık paketlerimiz var. Tüm çalışmalar yazılı sözleşmeyle yürür.",
      },
      {
        q: "Mersin dışındaki işletmelerle çalışıyor musunuz?",
        a: "Evet. Tarsus merkezliyiz ama Türkiye'nin her şehrinden markayla online çalışıyoruz.",
      },
      {
        q: "Haftada kaç paylaşım yapılmalı?",
        a: "Çoğu marka için haftada 3 ila 5 akış gönderisi ve her gün birkaç hikâye iyi bir başlangıçtır. Doğru sayı sektörünüze ve üretim bütçenize göre belirlenir. Sayıdan çok düzen ve kalite önemlidir.",
      },
      {
        q: "Yorum ve mesajlara siz mi cevap veriyorsunuz?",
        a: "Paketinize topluluk yönetimi dahilse evet. Sık gelen sorular için cevap şablonları hazırlıyor, satış ya da şikâyet içeren mesajları size anında iletiyoruz.",
      },
    ],
  },

  // ── Meta (Instagram, Facebook) ve TikTok reklamları ───────
  "meta-tiktok-reklamlari": {
    seoTitle: "Instagram Reklam Ajansı — Meta ve TikTok Reklam Yönetimi",
    seoDescription:
      "Instagram reklam ajansı FlixFlex: Instagram, Facebook ve TikTok reklamlarını kreatifiyle birlikte kuruyor, her gün takip ediyoruz. Pixel ve Conversion API kurulumu dahil.",
    h1: "Instagram Reklam Ajansı ve Meta Reklam Yönetimi",
    eyebrow: "Meta Reklam Yönetimi Rehberi",
    sections: [
      {
        heading: "Instagram reklam ajansı olarak ne yapıyoruz?",
        paragraphs: [
          "Meta reklamları; Instagram, Facebook ve Messenger'da gösterilen ücretli reklamlardır ve hepsi Meta Reklam Yöneticisi üzerinden yönetilir. FlixFlex olarak Instagram reklam yönetimi, Facebook reklam yönetimi ve TikTok reklamlarını kreatifiyle birlikte kuruyor, her gün takip ediyoruz.",
          "Bir Instagram reklam ajansıyla çalışmanın asıl faydası, reklam stratejisinin, kreatifin ve ölçümün tek elde toplanmasıdır. Reklam kampanyalarınızı yalnızca yayına almakla kalmıyor, hangi reklamın satış getirdiğini ölçüp bütçeyi ona göre kaydırıyoruz.",
        ],
      },
      {
        heading: "Meta reklam yönetimi sürecimiz",
        bullets: [
          "Ölçüm kurulumu: Meta Pixel, Conversion API, dönüşüm olayları ve ürün kataloğu bağlantısı. Ölçüm doğru değilse reklam performansınızı da doğru okuyamazsınız.",
          "Hedef kitle analizleri: mevcut müşterileriniz, web sitenize gelen ziyaretçiler ve ilgi alanlarına göre kitleler, benzer kitleler ve konum hedeflemesi.",
          "Kreatif üretimi: kaydırmayı durduran ilk saniye için video, motion design ve görsel reklamlar. Grafik tasarım ve video prodüksiyonu ekibimizin içinde.",
          "Kampanya kurulumu: işletmenizin hedeflerine göre doğru kampanya amacı (satış, mesaj, potansiyel müşteri, trafik) ve bütçe dağılımı.",
          "Günlük takip ve optimizasyon: kötü giden reklamı durdurup iyi gideni büyütüyoruz. A/B testleriyle dönüşüm oranınızı artırmaya çalışıyoruz.",
          "Raporlama: harcamayı, satışları ve mesaj başı maliyeti canlı panelden takip edersiniz.",
        ],
        paragraphs: [
          "Ölçüm altyapısının nasıl kurulduğunu [Meta Pixel ve Conversion API kurulumu](/blog/meta-pixel-conversion-api-kurulumu) yazımızda adım adım anlattık.",
        ],
      },
      {
        heading: "Meta reklam kampanyası türleri",
        paragraphs: [
          "Meta Reklam Yöneticisi'nde kampanya oluştururken ilk seçim kampanya amacıdır ve reklamın kime gösterileceğini doğrudan bu seçim belirler. Satış istiyorsanız trafik kampanyası açmak, en sık yapılan ve en pahalıya mal olan hatalardan biridir.",
        ],
        bullets: [
          "Bilinirlik: markanızı mümkün olduğunca çok kişiye, düşük maliyetle göstermek için.",
          "Trafik: web sitenize ya da profilinize ziyaretçi çekmek için.",
          "Etkileşim: mesaj, video izlenmesi ve gönderi etkileşimi için. Yerel işletmelerde WhatsApp ve Instagram mesajı getiren kampanyalar burada kurulur.",
          "Potansiyel müşteri: form doldurtmak ya da randevu toplamak için.",
          "Uygulama tanıtımı: mobil uygulama indirmeleri için.",
          "Satış: web sitenizde ya da katalogdan satın alma getirmek için. E-ticaret markalarının ana kampanya türüdür.",
        ],
      },
      {
        heading: "İyi bir Instagram reklamı nasıl olmalı?",
        bullets: [
          "İlk 3 saniye: izleyici kaydırmadan önce ne sattığınızı ya da hangi sorunu çözdüğünüzü görmeli.",
          "Dikey format: Reels ve hikâyeler için 9:16 dikey video, akış için 4:5 görsel kullanıyoruz.",
          "Net teklif: indirim, ücretsiz kargo, ücretsiz deneme ya da ilk görüşme. Neden şimdi alması gerektiğini söyleyin.",
          "Sosyal kanıt: müşteri yorumları, kullanım görüntüleri ve satış sayıları güven verir.",
          "Açık çağrı: mesaj gönder, satın al, formu doldur. Tek reklamda tek eylem.",
          "Varyasyon: aynı mesajı farklı görsel ve başlıklarla test ediyor, kazananı büyütüyoruz.",
        ],
      },
      {
        heading: "Reklam kreatifinde içerik üretim süreci",
        paragraphs: [
          "Meta reklamlarında sonucu en çok kreatif belirliyor. Hedefleme giderek otomatikleşiyor, bu yüzden doğru kişiyi bulmanın yolu doğru videodan geçiyor. İçerik üretim sürecimizi bu yüzden reklam ekibiyle birlikte yürütüyoruz.",
        ],
        bullets: [
          "Fikir: ürününüzün çözdüğü sorunu ve müşterinin itirazlarını listeliyoruz.",
          "Kanca: ilk 3 saniye için birkaç farklı açılış yazıyoruz.",
          "Üretim: motion design, görsel ve kısa video varyasyonları hazırlıyoruz.",
          "Test: varyasyonları aynı bütçeyle yayınlıyor, kazananı büyütüyoruz.",
          "Yenileme: frekans yükselip sonuç düşmeye başlayınca yeni kreatifleri devreye alıyoruz.",
        ],
      },
      {
        heading: "Instagram reklam ajansı seçerken sormanız gereken sorular",
        bullets: [
          "Reklam hesabı kimin adına olacak? Hesap ve veriler işletmenizde kalmalı.",
          "Kreatifleri kim üretiyor? Ayrı bir firmaya gidiyorsa süreç uzar.",
          "Hangi metriği takip edeceksiniz? Beğeni değil, satış ve mesaj başı maliyet konuşulmalı.",
          "Ne sıklıkla kontrol ediyorsunuz? Meta reklamları günlük takip ister.",
          "Sonuçları nasıl göreceğim? Ay sonu raporu yerine canlı panel çok daha güven verir.",
        ],
      },
      {
        heading: "Reklam performansınızı hangi metriklerle ölçüyoruz?",
        paragraphs: [
          "Beğeni ve erişim tek başına bir şey söylemez. Reklam performansını işletmenizin hedefiyle bağlantılı metriklere bakarak değerlendiriyoruz. E-ticarette harcanan her liranın kaç lira satış getirdiğini (ROAS) ve satış başı maliyeti, yerel işletmelerde mesaj ve arama başı maliyeti, hizmet işletmelerinde form başı maliyeti takip ediyoruz.",
          "Tıklama oranı, gösterim başı maliyet ve aynı kişinin reklamı kaç kez gördüğü (frekans) ise kreatifin ne zaman yorulduğunu gösterir. Bu verileri günlük izleyip yeni reklamları zamanında devreye alıyoruz.",
        ],
      },
      {
        heading: "Instagram reklam verme: kendiniz mi, ajansla mı?",
        paragraphs: [
          "Instagram'da reklam vermek için bir işletme hesabı ve Meta Reklam Yöneticisi yeterlidir. Bir gönderiyi öne çıkarmak birkaç dakika sürer. Ancak öne çıkarma butonu çoğu zaman beğeni getirir, satış getirmez.",
          "Doğru hedef kitleye ulaşmak, kampanya amacını seçmek, pixel verisini okumak ve kreatifi test etmek deneyim ister. Reklam verip satış alamayan işletmelerin çoğunda sorun bütçe değil, kurulumdur. Bu konuyu [Instagram reklamları neden işe yaramıyor?](/blog/instagram-reklamlari-neden-ise-yaramiyor) yazımızda ayrıntılı anlattık.",
        ],
      },
      {
        heading: "Facebook reklam ajansı ve TikTok reklamları",
        paragraphs: [
          "Facebook, özellikle 30 yaş üstü kitlelerde ve yerel işletmelerde hâlâ güçlü bir kanal. Instagram ile Facebook'u aynı Meta reklam hesabından birlikte yönetiyor, TikTok için TikTok Ads Manager'da ayrı kampanyalar kuruyoruz.",
          "Hangi platforma ne kadar bütçe ayrılacağına tahminle değil, reklam performansına bakarak karar veriyoruz. Markanızın dijital dünyada hangi kanalda daha ucuza müşteri bulduğu birkaç haftalık testle netleşir.",
        ],
      },
      {
        heading: "Hangi işletmeler için uygun?",
        bullets: [
          "E-ticaret markaları: katalog reklamları, sepeti terk edenlere yeniden pazarlama ve satış kampanyaları. Filinta Kuruyemiş'in Meta reklamlarını ve e-ticaret büyümesini bu yapıyla yönetiyoruz.",
          "Yerel işletmeler: mağaza, restoran ve hizmet işletmeleri için mesaj ve arama getiren kampanyalar. Kurt Ofis Tarsus bu modelle çalıştığımız markalardan biri.",
          "Hizmet işletmeleri: form ve randevu toplayan potansiyel müşteri kampanyaları.",
          "Yeni markalar: bilinirlik ve takipçi kazanımı için video odaklı reklamlar.",
        ],
      },
      {
        heading: "Instagram reklam ücretleri ve bütçe",
        paragraphs: [
          "Instagram reklam ücretleri iki kalemden oluşur: Meta'ya ödenen reklam bütçesi ve reklam yönetimi hizmet bedeli. Reklam bütçesini siz belirlersiniz ve doğrudan Meta'ya ödenir, biz bu bütçenin nasıl harcanacağını yönetiriz. Sektör, rekabet ve hedef kitlenin büyüklüğü tıklama ve mesaj maliyetini etkiler.",
          "2026 için güncel rakamları [Instagram Reklam Fiyatları 2026](/blog/instagram-reklam-fiyatlari-2026) yazımızda topladık.",
        ],
      },
      {
        heading: "Mersin, Tarsus ve Adana'da Meta reklam yönetimi",
        paragraphs: [
          "Yerel işletmeler için reklamları ilçe ve semt düzeyinde hedefleyebiliyoruz. Mersin, Tarsus ve Adana'daki markalarla bölgeyi tanıyarak çalışıyor, Türkiye genelinde satış yapan markalar içinse reklam hesaplarınızı uzaktan yönetiyoruz. Mersin'deki işletmeler için [Mersin Sosyal Medya Ajansı](/mersin-sosyal-medya-ajansi) sayfamızı inceleyebilirsiniz.",
        ],
      },
    ],
    faqs: [
      {
        q: "Reklam bütçesi hizmet ücretine dahil mi?",
        a: "Hayır. Reklam bütçesi kendi kartınızla doğrudan Meta'ya ödenir. Biz yalnızca yönetim hizmeti için ücret alırız, böylece harcamanın tamamını kendi hesabınızda görürsünüz.",
      },
      {
        q: "Minimum reklam bütçesi ne kadar olmalı?",
        a: "Sektöre ve hedefe göre değişir. Reklamların öğrenme dönemini tamamlayacak kadar veri toplayan bir günlük bütçeyle başlamayı öneriyoruz. Ön görüşmede hedefinize uygun bütçeyi birlikte belirliyoruz.",
      },
      {
        q: "Reklam veremiyorum ya da hesabım kapatıldı, yardımcı olur musunuz?",
        a: "Evet. Reddedilen reklamları ve kısıtlanan hesapları inceliyor, itiraz sürecinde yol gösteriyoruz. Son karar Meta'ya ait olduğu için hesabın açılacağını garanti edemiyoruz.",
      },
      {
        q: "Mevcut reklam hesabımı kullanabilir miyiz?",
        a: "Evet. Hesabınıza yönetici olarak ekleniriz. Reklam hesabı, pixel ve tüm veriler sizde kalır.",
      },
      {
        q: "Sonuçları nasıl takip edeceğim?",
        a: "Harcama, satış ve mesaj sayılarını canlı bir panelden istediğiniz an görürsünüz. Ay sonunda neyin işe yaradığını ve sıradaki adımı birlikte konuşuruz.",
      },
      {
        q: "Reklamlar ne zaman sonuç vermeye başlar?",
        a: "Yeni bir kampanya ilk günlerde Meta'nın öğrenme dönemindedir ve maliyetler dalgalı olabilir. Çoğu hesapta ilk anlamlı sonuçlar birkaç hafta içinde netleşir. Kesin süre sektöre, bütçeye ve teklife göre değiştiği için sonuç garantisi vermiyoruz.",
      },
      {
        q: "Reklam görsellerini ve videolarını siz mi hazırlıyorsunuz?",
        a: "Evet. Reklam kreatifleri, motion design videolar ve reklam metinleri ekibimiz tarafından hazırlanır. Elinizde ürün görselleri ya da videolar varsa onları da kullanırız.",
      },
      {
        q: "Ücretsiz reklam incelemesi nedir?",
        a: "Mevcut reklamlarınıza 20 dakika birlikte bakıyoruz. İşinize yarayacak bir şey bulamazsak kahveniz bizden.",
      },
    ],
  },

  // ── Kurumsal web tasarım ──────────────────────────────────
  "web-sitesi-tasarimi": {
    seoTitle: "Kurumsal Web Tasarım — Web Sitesi Yaptırma",
    seoDescription:
      "Kurumsal web tasarım ve web sitesi yaptırma: özel tasarım, mobil uyumlu, hızlı siteler. Mersin web tasarım ve Türkiye geneli projeler için FlixFlex'ten ücretsiz teklif alın.",
    h1: "Kurumsal Web Tasarım ve Web Sitesi Yaptırma",
    eyebrow: "Kurumsal Web Tasarım Rehberi",
    sections: [
      {
        heading: "Kurumsal web tasarım hizmetimiz",
        paragraphs: [
          "Web siteniz internetteki vitrininizdir. Günün her saati çalışan bir satış temsilcisi gibidir. Kurumsal web tasarım projelerinde üç şeyi birlikte kuruyoruz: markanıza özel tasarım, hızlı altyapı ve satışa götüren sayfa düzeni. Hazır tema satmıyoruz. Her sayfayı işletmenizin hedefine göre tasarlıyoruz.",
        ],
      },
      {
        heading: "Kurumsal web sitesinde neler var?",
        bullets: [
          "Özel tasarım: marka kimliğinize uygun, rakiplerinizden ayrışan bir arayüz.",
          "Mobil uyumluluk: ziyaretçilerinizin çoğu mobil cihazdan gelir, tasarım önce telefona göre kurulur.",
          "Yönetim paneli: kod bilmeden metin, görsel, blog ve proje ekleyebileceğiniz içerik yönetimi.",
          "Hız ve SEO altyapısı: hızlı açılan sayfalar, meta etiketler, site haritası ve yapılandırılmış veri.",
          "Çoklu dil: yurt dışına satış yapan firmalar için birden fazla dilde site.",
          "Entegrasyonlar: iletişim formu, WhatsApp, e-posta bildirimleri, Google Analytics ve Meta Pixel.",
        ],
      },
      {
        heading: "İyi bir kurumsal web sitesinin özellikleri",
        bullets: [
          "Hız: sayfa 3 saniyede açılmıyorsa ziyaretçilerin önemli kısmı geri döner. Görselleri optimize ediyor, gereksiz kodu kaldırıyoruz.",
          "Net mesaj: ziyaretçi ilk ekranda ne yaptığınızı, kime hizmet verdiğinizi ve bir sonraki adımı anlamalı.",
          "Güven unsurları: referanslar, müşteri yorumları, sertifikalar ve gerçek iletişim bilgileri.",
          "Kolay iletişim: her sayfadan ulaşılabilen telefon, WhatsApp ve teklif formu.",
          "Güncel içerik: blog ve proje sayfalarıyla Google'a düzenli yeni içerik sunmak sıralamaları destekler.",
          "Yasal uyum: KVKK aydınlatma metni, çerez politikası ve gizlilik metinleri.",
        ],
      },
      {
        heading: "Kurumsal site mi, e-ticaret mi, tek sayfa mı?",
        paragraphs: [
          "Hizmet veren firmalar için birkaç sayfalık kurumsal site çoğu zaman yeterlidir. Ana sayfa, hizmetler, referanslar, hakkımızda ve iletişim işi görür. Ürün satıyorsanız ödeme, stok ve kargo altyapısı olan bir e-ticaret sitesine ihtiyacınız olur. Tek bir kampanya için ise tek sayfalık bir açılış sayfası daha hızlı ve ekonomiktir.",
          "Hangisinin size uygun olduğuna birlikte karar veriyoruz. Gereğinden büyük bir site hem bütçeyi hem yayın süresini uzatır. Hazır altyapıyla hızlı başlamak isteyen mağazalar için [ikas partner ajansı](/ikas-partner-ajansi) sayfamıza da bakabilirsiniz.",
        ],
      },
      {
        heading: "Web sitesi yaptırmak isteyenler için süreç",
        paragraphs: [
          "Önce kısa bir görüşmede ihtiyacınıza göre sayfa yapısını ve içerik planını çıkarıyoruz. Tasarım onayınızdan sonra geliştirmeye geçiyor, siteyi farklı mobil cihazlarda test ediyoruz. Yayından sonra yönetim panelinin kullanımını gösteriyor ve destek vermeye devam ediyoruz.",
          "Teslim tarihini işe başlamadan yazılı olarak veriyoruz. Söz verdiğimiz tarihte teslim etmezsek o ayın ücretini almıyoruz.",
        ],
      },
      {
        heading: "Web tasarım fiyatları neye göre değişir?",
        paragraphs: [
          "Web tasarım fiyatlarını belirleyen başlıca etkenler sayfa sayısı, tasarımın özel mi hazır mı olduğu, yönetim paneli, çoklu dil, e-ticaret ihtiyacı, entegrasyonlar ve metin, görsel ya da video üretiminin işe dahil olup olmadığıdır. Bu yüzden tek bir fiyat yerine ihtiyacınıza göre net teklif veriyoruz. Teklifte gizli kalem olmaz.",
          "Online satış yapacaksanız [E-ticaret sitesi kurma maliyeti](/blog/e-ticaret-sitesi-kurma-maliyeti-2026) yazımız bütçe planına yardımcı olur.",
        ],
      },
      {
        heading: "Neden FlixFlex web tasarım ajansı?",
        paragraphs: [
          "Web sitesini reklam ve sosyal medyayla birlikte düşünüyoruz. Meta reklamlarından ve Google'dan gelen ziyaretçi, satın alma ya da form adımına kolayca ulaşmalı. Sayfaları buna göre kuruyoruz. Analitik ve pixel kurulumu da yayın günü hazır olur. Böylece web sitenizin kaç müşteri getirdiğini ilk günden görürsünüz.",
        ],
      },
      {
        heading: "Web sitesi yayına girdikten sonra ne olur?",
        paragraphs: [
          "Site açmak işin başlangıcı. Asıl fark yayından sonraki aylarda ortaya çıkar. Hangi sayfanın okunduğuna, hangi butona tıklandığına ve ziyaretçinin nerede çıktığına bakıyoruz. Gerekli düzeltmeleri bu verilere göre yapıyoruz.",
        ],
        bullets: [
          "Search Console kurulumu: sitenizin Google'da hangi aramalarda çıktığını görürsünüz.",
          "Yedekleme ve güvenlik: site düzenli yedeklenir, SSL sertifikası aktif kalır.",
          "İçerik ekleme: yeni hizmet, proje ve blog yazılarını panelden kendiniz ekleyebilirsiniz.",
          "Teknik destek: bir şey bozulursa kime yazacağınız bellidir, aynı gün dönüş yaparız.",
        ],
      },
      {
        heading: "Hangi sektörlere web sitesi yapıyoruz?",
        bullets: [
          "Üretim ve ihracat: ürün kataloğu, çoklu dil ve teklif formu.",
          "Sağlık ve klinikler: hizmet sayfaları, doktor profilleri ve randevu.",
          "Yeme içme ve turizm: menü, rezervasyon ve konum.",
          "Mağaza ve e-ticaret: ürün sayfaları, ödeme ve kargo.",
          "Hizmet firmaları: referans, süreç ve hızlı iletişim butonları.",
        ],
      },
      {
        heading: "Mersin ve Adana'da web tasarım",
        paragraphs: [
          "Tarsus merkezli ekibimizle Mersin, Tarsus ve Adana'daki işletmelerin kurumsal web sitelerini tasarlıyoruz. Türkiye'nin diğer şehirlerindeki firmalarla süreci tamamen online yürütüyoruz. Bölgeye özel ayrıntılar için [Mersin Web Tasarım](/mersin-web-tasarim) ve [Adana Web Tasarım](/adana-web-tasarim) sayfalarımıza bakabilirsiniz.",
        ],
      },
    ],
    faqs: [
      {
        q: "Kurumsal bir web sitesi ne kadar sürede hazır olur?",
        a: "Sayfa sayısına ve özelliklere göre değişir. İlk görüşmede net bir takvim çıkarır, teslim tarihini yazılı olarak veririz.",
      },
      {
        q: "Siteyi sonradan kendim güncelleyebilir miyim?",
        a: "Evet. Yönetim paneliyle metin, görsel, blog yazısı ve proje ekleyebilirsiniz. Kullanımı teslimde birlikte gözden geçiriyoruz.",
      },
      {
        q: "Alan adı ve hosting işlerini siz mi hallediyorsunuz?",
        a: "Kurulum sırasında alan adı ve barındırma ihtiyacını birlikte planlıyoruz. Mevcut alan adınız varsa onu kullanırız.",
      },
      {
        q: "Mevcut web sitemi yenileyebilir misiniz?",
        a: "Evet. Mevcut sitenizin içeriğini ve Google'daki sıralamalarını koruyarak yeni tasarıma taşıyoruz.",
      },
      {
        q: "Sitenin metinlerini ve görsellerini siz mi hazırlıyorsunuz?",
        a: "İsterseniz evet. Sayfa metinleri, ürün ve hizmet görselleri ile motion design videoları ekibimiz hazırlayabilir. Kendi içeriklerinizi de kullanabiliriz.",
      },
      {
        q: "SEO çalışması web tasarıma dahil mi?",
        a: "Temel teknik SEO altyapısı her sitede hazır gelir. Düzenli içerik ve anahtar kelime çalışması ayrı bir hizmettir.",
      },
      {
        q: "E-ticaret sitesi de yapıyor musunuz?",
        a: "Evet. Ürün, ödeme ve kargo altyapısı gereken projeler için [E-ticaret Çözümleri](/hizmetler/e-ticaret-cozumleri) hizmetimize göz atabilirsiniz.",
      },
    ],
  },

  // ── Dijital pazarlama ajansı (üst hizmet) ─────────────────
  "performans-pazarlamasi": {
    seoTitle: "Dijital Pazarlama Ajansı — Performans Pazarlaması",
    seoDescription:
      "Dijital pazarlama ajansı FlixFlex: Meta ve Google reklamları, SEO, sosyal medya ve dönüşüm çalışmaları tek ekipte. Tarsus merkezli, Türkiye geneli. Ücretsiz inceleme alın.",
    h1: "Dijital Pazarlama Ajansı ve Performans Yönetimi",
    eyebrow: "Dijital Pazarlama Rehberi",
    sections: [
      {
        heading: "Dijital pazarlama ajansı ne yapar?",
        paragraphs: [
          "Dijital pazarlama ajansı, işletmenizin internetteki müşteri yolculuğunu baştan sona yönetir. Reklam, arama motoru optimizasyonu, sosyal medya pazarlaması ve web sitesi bu yolculuğun parçalarıdır. Amaç, markaların dijital kanallarda hedef kitlelerine ulaşmasını sağlamak ve bu ilgiyi satışa çevirmektir.",
          "FlixFlex, Tarsus merkezli bir pazarlama ajansı. Performans yönetimi tarafında her harcamanın ne getirdiğini ölçüyoruz. Aynı zamanda kreatifi, web tasarımı işini ve içeriği aynı ekipte yürütüyoruz.",
        ],
      },
      {
        heading: "Performans pazarlaması nedir?",
        paragraphs: [
          "Performans pazarlamasında bütçe, ölçülebilir sonuçlara göre yönetilir. Gösterim ya da beğeni değil; satış, form, mesaj ve arama sayılır. Hangi kampanya kazandırıyorsa bütçe oraya gider, kazandırmayan kampanya durur.",
          "Bunun çalışması için ölçümün doğru kurulması gerekir. Meta Pixel, Conversion API ve Google Analytics olmadan hangi reklamın satış getirdiğini bilemezsiniz. Bu yüzden işe önce ölçümle başlıyoruz.",
        ],
      },
      {
        heading: "Dijital pazarlama hizmetlerimiz",
        bullets: [
          "Meta ve TikTok reklamları: Instagram, Facebook ve TikTok'ta kreatifiyle birlikte kampanya yönetimi. [Meta reklam yönetimi](/hizmetler/meta-tiktok-reklamlari)",
          "Google Ads: sizi arayan kişiye ulaşan arama ve alışveriş kampanyaları. [Google Ads yönetimi](/hizmetler/google-ads-yonetimi)",
          "SEO ve içerik: arama motoru sonuçlarında kalıcı görünürlük. [SEO ve içerik stratejisi](/hizmetler/seo-icerik-stratejisi)",
          "Sosyal medya pazarlaması: içerik takvimi, üretim ve hesap yönetimi. [Sosyal medya yönetimi](/hizmetler/sosyal-medya-yonetimi)",
          "Web sitesi ve açılış sayfaları: reklamdan gelen ziyaretçiyi müşteriye çeviren sayfalar. [Kurumsal web tasarım](/hizmetler/web-sitesi-tasarimi)",
          "Dönüşüm optimizasyonu: aynı trafikle daha fazla satış için testler. [Dönüşüm optimizasyonu](/hizmetler/donusum-optimizasyonu)",
        ],
      },
      {
        heading: "Çalışma şeklimiz",
        paragraphs: [
          "Her işe aynı soruyla başlıyoruz: ayda kaç müşteri istiyorsunuz? Bütçeyi ve kanalları bu hedeften geriye doğru hesaplıyoruz. Böylece hedef kitlenize etkili bir şekilde ulaşan bir plan çıkıyor.",
        ],
        bullets: [
          "İnceleme: mevcut reklamlarınıza, sitenize ve dijital varlığınıza bakıyoruz.",
          "Plan: hangi kanala ne kadar bütçe ayrılacağını yazıyoruz.",
          "Kurulum: ölçüm, kampanya ve kreatifleri hazırlıyoruz.",
          "Takip: reklamları her gün kontrol ediyor, kazananı büyütüyoruz.",
          "Değerlendirme: sonuçları canlı panelden birlikte izliyor, sıradaki adımı konuşuyoruz.",
        ],
      },
      {
        heading: "Dijital pazarlama ajansından neler beklemelisiniz?",
        bullets: [
          "Hesap sahipliği: reklam hesapları, pixel ve tüm veriler sizde kalmalı.",
          "Şeffaf bütçe: reklam harcaması ile hizmet bedeli ayrı görünmeli.",
          "Gerçek metrikler: beğeni yerine satış ve müşteri başı maliyet konuşulmalı.",
          "Hızlı iletişim: sorularınıza aynı gün cevap verilmeli.",
          "Yazılı söz: neyin ne zaman teslim edileceği belli olmalı.",
        ],
        paragraphs: [
          "Bir dijital pazarlama ajansından bunları istemek hakkınız. Seçim yaparken yardımcı olması için [Reklam Ajansı Nasıl Seçilir?](/blog/reklam-ajansi-nasil-secilir) yazımızı okuyabilirsiniz.",
        ],
      },
      {
        heading: "Hangi işletmeler için uygun?",
        paragraphs: [
          "E-ticaret markaları, yerel işletmeler ve hizmet firmalarıyla çalışıyoruz. Bursaspor Basketbol, Filinta Kuruyemiş, Pet Gourmet ve Mysan Grup birlikte çalıştığımız markalardan bazıları. Dijital varlığımız kadar müşterilerimizin işleri de konuşsun diye projeleri [portfolyo](/portfolio) sayfamızda topladık.",
          "Mersin, Tarsus ve Adana'daki işletmelerle yüz yüze de görüşüyoruz. Türkiye'nin diğer şehirlerindeki markalarla süreci online yürütüyoruz.",
        ],
      },
    ],
    faqs: [
      {
        q: "Dijital pazarlama ajansı ile çalışmanın maliyeti nedir?",
        a: "Ücret, yönetilen kanal sayısına ve işin kapsamına göre değişir. Reklam bütçesi ise doğrudan Meta'ya ya da Google'a ödenir. İhtiyacınızı dinledikten sonra net bir teklif hazırlıyoruz.",
      },
      {
        q: "Ne kadar sürede sonuç alırım?",
        a: "Reklamlarda ilk veriler genellikle birkaç hafta içinde netleşir. SEO ise aylar süren bir çalışmadır. Sonuçlar sektöre ve bütçeye göre değiştiği için kesin rakam vaat etmiyoruz.",
      },
      {
        q: "Tek bir hizmet alabilir miyim?",
        a: "Evet. Yalnızca reklam, yalnızca sosyal medya ya da yalnızca web sitesiyle başlayabilirsiniz.",
      },
      {
        q: "Sözleşme süresi ne kadar?",
        a: "Aylık, 3, 6 ve 12 aylık paketlerimiz var. Tüm çalışmalar yazılı sözleşmeyle yürür.",
      },
      {
        q: "Ücretsiz inceleme nasıl işliyor?",
        a: "Mevcut reklamlarınıza 20 dakika birlikte bakıyoruz. İşinize yarayacak bir şey bulamazsak kahveniz bizden.",
      },
    ],
  },

  // ── Google Ads ────────────────────────────────────────────
  "google-ads-yonetimi": {
    seoTitle: "Google Ads Ajansı ve Google Reklam Yönetimi",
    seoDescription:
      "Google Ads ajansı FlixFlex: arama, alışveriş, Performance Max ve YouTube kampanyalarını kuruyor, her gün takip ediyoruz. Mersin ve Türkiye geneli. Ücretsiz inceleme alın.",
    h1: "Google Ads Ajansı ve Google Ads Yönetimi",
    eyebrow: "Google Ads Rehberi",
    sections: [
      {
        heading: "Google Ads ajansı olarak ne yapıyoruz?",
        paragraphs: [
          "Google Ads, Google'ın reklam platformudur. Ürün veya hizmetlerinize ihtiyaç duyan kişi arama motoru sonuçlarında sizi ararken karşısına çıkmanızı sağlar. Bu yüzden satın almaya en yakın potansiyel müşterilere ulaşmanın en doğrudan yollarından biridir.",
          "FlixFlex, Tarsus merkezli bir Google reklam ajansı olarak Google Ads kampanyası kurulumunu, anahtar kelime seçimini, reklam metinlerini ve günlük takibi üstleniyor. Google Ads reklamlarını diğer dijital pazarlama işlerinizle birlikte planlıyoruz.",
        ],
      },
      {
        heading: "Hangi kampanya türü size uygun?",
        paragraphs: [
          "Doğru kampanya türü işletmenizin hedefine göre değişir. İyi sonuçlar almak için önce bu seçimi doğru yapmak gerekir.",
        ],
        bullets: [
          "Arama kampanyaları: Google'da sizi arayan kişiye metin reklamıyla ulaşırsınız. Hizmet işletmeleri için en sık tercih edilen türdür.",
          "Alışveriş kampanyaları: ürün görseli ve fiyatınız arama sonuçlarında görünür. E-ticaret için güçlüdür.",
          "Performance Max: Google'ın tüm kanallarında otomatik çalışır. İyi veri ve iyi görsel ister.",
          "YouTube reklamları: videolu tanıtım ve yeniden pazarlama için.",
          "Görüntülü reklam ağı: sitenizi ziyaret etmiş kişilere yeniden ulaşmak için.",
        ],
      },
      {
        heading: "Google Ads yönetimi sürecimiz",
        bullets: [
          "Hesap incelemesi: mevcut kampanyalarınızı, boşa giden aramaları ve dönüşüm ölçümünü kontrol ediyoruz.",
          "Anahtar kelime araştırması: satın alma niyeti yüksek aramaları ve hariç tutulacak kelimeleri belirliyoruz.",
          "Dönüşüm kurulumu: arama, form ve satın alma ölçümünü doğru kuruyoruz.",
          "Reklam metinleri: aramaya uygun başlıklar ve ek bilgiler yazıyoruz.",
          "Açılış sayfası: reklamı web sitesi tarafında doğru sayfaya bağlıyor, gerekirse sayfayı düzeltiyoruz.",
          "Günlük takip: teklifleri, arama terimlerini ve bütçeyi izliyoruz.",
        ],
      },
      {
        heading: "Google Ads'te bütçe boşa nerede gider?",
        bullets: [
          "Geniş eşleme ve hariç tutulmayan kelimeler: alakasız aramalara ödeme yaparsınız.",
          "Eksik dönüşüm ölçümü: algoritma kimin müşteri olduğunu öğrenemez.",
          "Yanlış konum ayarı: hizmet vermediğiniz bölgelerde görünürsünüz.",
          "Ana sayfaya yönlendirmek: ziyaretçi aradığını bulamayınca çıkar.",
          "Rakip kelimelerde kontrolsüz teklif: pahalı tıklama getirir, satış getirmeyebilir.",
        ],
      },
      {
        heading: "Google Ads mi, Meta reklamları mı?",
        paragraphs: [
          "Google sizi zaten arayan kişiye ulaşır. Meta ise henüz aramayan ama ilgilenebilecek kişiye ulaşır. Aranan bir hizmetiniz varsa Google ile başlamak çoğu zaman mantıklıdır. Görsel olarak anlatılan bir ürününüz varsa Meta daha hızlı sonuç verebilir.",
          "İkisini birlikte kullanan işletmelerde bütçeyi verilere göre paylaştırıyoruz. Meta tarafını [Meta ve TikTok Reklamları](/hizmetler/meta-tiktok-reklamlari) sayfamızda anlattık. Maliyetler için [Google Ads Maliyeti 2026](/blog/google-ads-maliyeti-2026) yazımıza bakabilirsiniz.",
        ],
      },
    ],
    faqs: [
      {
        q: "Google Ads bütçesi hizmet ücretine dahil mi?",
        a: "Hayır. Reklam bütçesi kendi kartınızla doğrudan Google'a ödenir. Biz yalnızca yönetim hizmeti için ücret alırız.",
      },
      {
        q: "Google Ads mi, SEO mu?",
        a: "Google Ads hızlı trafik getirir ama reklam durunca trafik de durur. SEO daha yavaştır ama kalıcıdır. Çoğu işletme için en iyisi ikisini birlikte planlamaktır.",
      },
      {
        q: "Google Ads hesabım kimin olur?",
        a: "Hesap ve tüm veriler size ait olur. Biz hesabınıza yönetici olarak ekleniriz.",
      },
      {
        q: "Ne zaman sonuç alırım?",
        a: "Arama kampanyalarında tıklamalar ilk günden gelir. Maliyetlerin oturması genellikle birkaç hafta sürer. Sektöre göre değiştiği için kesin rakam vaat etmiyoruz.",
      },
      {
        q: "Mersin dışında da çalışıyor musunuz?",
        a: "Evet. Tarsus merkezliyiz, Türkiye'nin her şehrindeki işletmelerin Google Ads hesaplarını yönetiyoruz.",
      },
    ],
  },

  // ── E-ticaret ─────────────────────────────────────────────
  "e-ticaret-cozumleri": {
    seoTitle: "E-Ticaret Ajansı — E-Ticaret Sitesi Kurulumu ve Büyütme",
    seoDescription:
      "E-ticaret ajansı FlixFlex: ikas ve hazır altyapılarda mağaza kurulumu, ürün taşıma, ödeme ve kargo, Meta katalog reklamları ve SEO tek ekipte. Ücretsiz teklif alın.",
    h1: "E-Ticaret Çözümleri ve E-Ticaret Sitesi Kurulumu",
    eyebrow: "E-Ticaret Rehberi",
    sections: [
      {
        heading: "E-ticaret sitesi kurmak isteyenler için",
        paragraphs: [
          "Kendi e-ticaret siteniz komisyon ödemeden satış yapmanızı ve müşteri verisine sahip olmanızı sağlar. Ama site açmak tek başına satış getirmez. Ödeme, kargo, ölçüm ve reklam da doğru kurulmalıdır.",
          "FlixFlex olarak altyapı seçiminden ilk reklam kampanyasına kadar süreci birlikte yürütüyoruz. Filinta Kuruyemiş ve Filinta Moda'yı bu şekilde e-ticarete hazırladık.",
        ],
      },
      {
        heading: "E-ticaret çözümlerimiz",
        bullets: [
          "Altyapı seçimi: hazır altyapı mı, özel yazılım mı? İhtiyacınıza göre öneriyoruz.",
          "Mağaza kurulumu: tema, kategori, ürün sayfası, ödeme ve kargo ayarları.",
          "Ürün taşıma: pazaryerinden ya da eski sitenizden ürünlerin aktarılması.",
          "Ölçüm: Meta Pixel, Conversion API, Google Analytics ve ürün kataloğu.",
          "Reklam: Meta katalog reklamları, Google alışveriş ve yeniden pazarlama kampanyaları.",
          "SEO: kategori ve ürün sayfalarının Google'a hazırlanması.",
        ],
      },
      {
        heading: "ikas ile e-ticaret",
        paragraphs: [
          "Türkiye'de satış yapan mağazalar için ikas sık tercih ettiğimiz altyapılardan biri. Kurulum, tema, taşıma ve reklam tarafında neler yaptığımızı [ikas Partner Ajansı](/ikas-partner-ajansi) sayfamızda anlattık. Platformu tanımak istiyorsanız [ikas nedir](/blog/ikas-nedir) rehberimizi okuyabilirsiniz.",
        ],
      },
      {
        heading: "E-ticaret sitesi kurmanın maliyeti",
        paragraphs: [
          "Maliyeti altyapı ücreti, tasarım, ödeme komisyonları, kargo, içerik ve pazarlama belirler. Bütçenin tamamını siteye harcayıp reklama para bırakmamak en sık yapılan hatadır. Tüm kalemleri [E-ticaret Sitesi Kurma Maliyeti 2026](/blog/e-ticaret-sitesi-kurma-maliyeti-2026) yazımızda açtık.",
        ],
      },
    ],
    faqs: [
      {
        q: "E-ticaret sitesi ne kadar sürede açılır?",
        a: "Hazır altyapıda ürün içerikleri hazırsa birkaç hafta içinde açılabilir. Teslim tarihini işe başlamadan yazılı olarak veriyoruz.",
      },
      {
        q: "Pazaryerindeyim, ayrıca site açmalı mıyım?",
        a: "Çoğu marka için evet. Pazaryeri yeni müşteri getirir, kendi siteniz komisyonsuz tekrar satış ve müşteri verisi sağlar.",
      },
      {
        q: "Site açıldıktan sonra reklamları da yönetiyor musunuz?",
        a: "Evet. Mağazayı kuran ekip Meta ve Google reklamlarını da yönetiyor.",
      },
    ],
  },
}
