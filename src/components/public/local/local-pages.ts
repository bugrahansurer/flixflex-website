// ═══════════════════════════════════════════════════════════
// Şehir + hizmet açılış sayfaları (/mersin-web-tasarim vb.).
// Her sayfa kendi şehrine göre ayrı yazıldı; aynı metni şehir adı
// değiştirerek çoğaltmayın, Google bunu kopya içerik sayar.
// Gövde ve SSS, hizmet rehberleriyle aynı bileşenle render edilir.
// ═══════════════════════════════════════════════════════════

import type { ServiceGuide } from "@/components/public/services/service-guides"

export interface LocalPage {
  slug: string
  title: string
  description: string
  h1: string
  lead: string
  serviceName: string
  city: string
  areaServed: string[]
  guide: ServiceGuide
}

export const LOCAL_PAGES: Record<string, LocalPage> = {
  "mersin-web-tasarim": {
    slug: "mersin-web-tasarim",
    title: "Mersin Web Tasarım — Kurumsal Web Sitesi Yaptırma",
    description:
      "Mersin web tasarım: mobil uyumlu, hızlı ve Google'a hazır kurumsal web siteleri. Tarsus merkezli FlixFlex ile Mersin'de web sitesi yaptırın, ücretsiz teklif alın.",
    h1: "Mersin Web Tasarım",
    lead: "Mersin'deki işletmeler için hızlı açılan, mobilde kusursuz görünen ve ziyaretçiyi müşteriye çeviren kurumsal web siteleri tasarlıyoruz.",
    serviceName: "Web Sitesi Tasarımı",
    city: "Mersin",
    areaServed: ["Mersin", "Tarsus", "Mezitli", "Yenişehir", "Toroslar", "Akdeniz", "Erdemli", "Silifke"],
    guide: {
      eyebrow: "Mersin Web Tasarım",
      sections: [
        {
          heading: "Mersin'de web tasarım ajansı arayanlar için",
          paragraphs: [
            "Mersin; limanı, serbest bölgesi, narenciye ve tarım ihracatı, lojistik firmaları, turizmi ve hızla büyüyen hizmet sektörüyle Türkiye'nin en hareketli ticaret şehirlerinden biri. Bu çeşitlilik web sitelerine de yansıyor: ihracat yapan bir firmanın çoklu dil desteğine, bir klinik ya da restoranın hızlı randevu ve rezervasyona, bir mağazanın ise Instagram'dan gelen ziyaretçiyi satışa çevirecek sayfalara ihtiyacı var.",
            "FlixFlex, 2020'den bu yana Tarsus merkezli olarak çalışan bir dijital ajans. Mersin web tasarım projelerinde işletmenin ne sattığını, kime sattığını ve müşterinin siteye nereden geldiğini anlayarak işe başlıyoruz. Hazır tema yerine markanıza özel tasarım yapıyoruz.",
          ],
        },
        {
          heading: "Mersin'deki işletmeler için hangi siteleri yapıyoruz?",
          bullets: [
            "Kurumsal web sitesi: hizmet veren firmalar, fabrikalar ve ihracatçılar için güven veren, çoklu dil destekli siteler.",
            "E-ticaret sitesi: ürünlerini Türkiye geneline satmak isteyen Mersinli markalar için ödeme ve kargo altyapılı mağazalar.",
            "Açılış sayfası: Meta ya da Google reklamlarından gelen ziyaretçiyi tek bir eyleme yönlendiren kampanya sayfaları.",
            "Sağlık, turizm ve yeme-içme siteleri: randevu, rezervasyon ve WhatsApp bağlantısı öne çıkan, mobil öncelikli siteler.",
            "Web sitesi yenileme: eski, yavaş ya da mobilde bozuk görünen sitelerin Google sıralamalarını koruyarak yenilenmesi.",
          ],
        },
        {
          heading: "Mersin web tasarım sürecimiz",
          paragraphs: [
            "İlk görüşmeyi online ya da yüz yüze yapabiliyoruz. Bu görüşmede sayfa yapısını, içerik ihtiyacını ve teslim tarihini netleştiriyoruz. Tasarımı onayınıza sunduktan sonra geliştirmeye geçiyor, siteyi farklı telefonlarda ve tarayıcılarda test ediyoruz.",
            "Yayından önce Google Search Console, Google Analytics ve Meta Pixel kurulumunu yapıyoruz. Böylece sitenizin kaç ziyaretçi ve kaç talep getirdiğini ilk günden görürsünüz. Yayından sonra yönetim panelini kullanmayı gösteriyor, destek vermeye devam ediyoruz.",
          ],
        },
        {
          heading: "Neden Mersin'de yerel bir web tasarım ajansı?",
          bullets: [
            "Aynı bölgedeyiz: Mersin'in müşteri profilini, rekabetini ve sezonluk hareketlerini biliyoruz.",
            "Hızlı iletişim: sorularınıza e-posta zinciri yerine aynı gün dönüyoruz, gerektiğinde yüz yüze görüşüyoruz.",
            "Tek ekip: web sitesi, sosyal medya, Meta reklamları ve Google Ads aynı ekipte. Siteye trafik getirmek de bizim işimiz.",
            "Yazılı teslim sözü: teslim tarihini işe başlamadan yazılı veriyoruz. Zamanında teslim etmezsek o ayın ücretini almıyoruz.",
          ],
        },
        {
          heading: "Mersin'de web sitesi yaptırmak ne kadar tutar?",
          paragraphs: [
            "Fiyatı sayfa sayısı, tasarımın özel olup olmadığı, yönetim paneli, çoklu dil, e-ticaret ihtiyacı ve içerik üretimi belirler. Tek sayfalık bir kampanya sitesi ile çok dilli bir ihracatçı sitesinin bütçesi aynı olmaz. İhtiyacınızı dinleyip gizli kalem içermeyen net bir teklif veriyoruz.",
            "Kapsamın ayrıntıları için [Kurumsal Web Tasarım](/hizmetler/web-sitesi-tasarimi) sayfamıza göz atabilirsiniz.",
          ],
        },
        {
          heading: "Mersin'in tüm ilçelerine hizmet veriyoruz",
          paragraphs: [
            "Akdeniz, Mezitli, Toroslar, Yenişehir, Tarsus, Erdemli, Silifke, Anamur, Mut, Gülnar, Aydıncık, Bozyazı ve Çamlıyayla'daki işletmelerle çalışıyoruz. Komşu şehirdeki firmalar için [Adana Web Tasarım](/adana-web-tasarim) sayfamıza da bakabilirsiniz.",
          ],
        },
      ],
      faqs: [
        {
          q: "Mersin'de yüz yüze görüşebilir miyiz?",
          a: "Evet. Tarsus merkezliyiz, Mersin içindeki işletmelerle gerektiğinde yüz yüze görüşüyoruz. Görüşmelerin çoğunu online da yapabiliyoruz.",
        },
        {
          q: "Web sitesi ne kadar sürede yayına girer?",
          a: "Kapsama göre değişir. İlk görüşmede net bir takvim çıkarır, teslim tarihini yazılı olarak veririz.",
        },
        {
          q: "Sitemi kendim güncelleyebilir miyim?",
          a: "Evet. Yönetim paneliyle metin, görsel, blog yazısı ve proje ekleyebilirsiniz.",
        },
        {
          q: "Sitenin Google'da çıkması için ne yapıyorsunuz?",
          a: "Her sitede hız, meta etiketler, site haritası ve yapılandırılmış veri gibi teknik SEO altyapısını kuruyor, siteyi Search Console'a ekliyoruz. Düzenli içerik ve anahtar kelime çalışması ayrı bir hizmettir.",
        },
        {
          q: "Siteye reklamla ziyaretçi getirmeye de yardımcı oluyor musunuz?",
          a: "Evet. [Meta ve TikTok reklamları](/hizmetler/meta-tiktok-reklamlari) ile Google Ads kampanyalarını aynı ekip yönetiyor, siteyi baştan reklama uygun kuruyoruz.",
        },
      ],
    },
  },

  "adana-web-tasarim": {
    slug: "adana-web-tasarim",
    title: "Adana Web Tasarım — Kurumsal Web Sitesi ve E-Ticaret",
    description:
      "Adana web tasarım: Seyhan, Çukurova, Yüreğir ve Sarıçam'daki işletmeler için hızlı, mobil uyumlu kurumsal web siteleri ve e-ticaret siteleri. FlixFlex'ten ücretsiz teklif alın.",
    h1: "Adana Web Tasarım",
    lead: "Adana'daki firmalar için markaya özel, hızlı ve satış odaklı kurumsal web siteleri ile e-ticaret siteleri kuruyoruz.",
    serviceName: "Web Sitesi Tasarımı",
    city: "Adana",
    areaServed: ["Adana", "Seyhan", "Çukurova", "Yüreğir", "Sarıçam", "Ceyhan", "Kozan"],
    guide: {
      eyebrow: "Adana Web Tasarım",
      sections: [
        {
          heading: "Adana'daki işletmeler için web tasarım",
          paragraphs: [
            "Adana; tarım ve gıda üretimi, tekstil, otomotiv yan sanayi, sağlık ve perakende sektörleriyle Çukurova'nın ticaret merkezi. Bu sektörlerde müşteriler bir firmayı aramadan önce web sitesine bakıyor. Yavaş açılan, mobilde dağılan ya da güncellenmeyen bir site, iyi bir firmayı bile güvensiz gösterir.",
            "FlixFlex olarak Tarsus'taki ekibimizle Adana'ya kısa bir mesafedeyiz ve Adana web tasarım projelerini yerel firmaların ihtiyacına göre kuruyoruz. Her sitede marka kimliğinize uygun özel tasarım, hızlı altyapı ve kolay kullanılan bir yönetim paneli var.",
          ],
        },
        {
          heading: "Adana'da hangi web sitelerini yapıyoruz?",
          bullets: [
            "Kurumsal web siteleri: üretici firmalar, sanayi kuruluşları ve hizmet şirketleri için referans ve ürün odaklı siteler.",
            "E-ticaret siteleri: Adana'dan Türkiye geneline gıda, tekstil ya da yerel ürün satan markalar için online mağazalar.",
            "Sağlık ve klinik siteleri: hizmet sayfaları, doktor profilleri ve online randevuyla hasta adayının işini kolaylaştıran siteler.",
            "Restoran, kafe ve otel siteleri: menü, rezervasyon ve konum bilgisinin bir dokunuşla ulaşıldığı mobil öncelikli siteler.",
            "Kampanya sayfaları: reklam bütçesini boşa harcamamak için tek bir hedefe odaklanan açılış sayfaları.",
          ],
        },
        {
          heading: "Adana'da web sitesi yaptırırken nelere dikkat etmeli?",
          bullets: [
            "Hazır tema mı, özel tasarım mı? Hazır temalar ucuzdur ama binlerce sitede aynı görünür ve gereksiz kod nedeniyle yavaş açılır.",
            "Site kimin adına? Alan adı, barındırma ve yönetim paneli erişiminin sizde olduğundan emin olun.",
            "Mobil test: sitenin telefonda nasıl göründüğüne mutlaka kendiniz bakın. Ziyaretçilerin çoğu mobil cihazdan gelir.",
            "Ölçüm: Google Analytics ve Meta Pixel kurulmadan yayına giren bir site kaç müşteri getirdiğini gösteremez.",
            "Destek: yayından sonra kime ulaşacağınızı ve ne kadar sürede dönüş alacağınızı baştan konuşun.",
          ],
        },
        {
          heading: "Çalışma şeklimiz",
          paragraphs: [
            "İlk görüşmede ihtiyacınızı dinleyip sayfa yapısını ve teslim tarihini netleştiriyoruz. Tasarım onayından sonra geliştirme, mobil testler ve yayın geliyor. Teslim tarihini yazılı olarak veriyoruz, zamanında teslim etmezsek o ayın ücretini almıyoruz.",
            "Web sitesini sosyal medya ve reklamlarla birlikte düşünüyoruz. Aynı ekip [sosyal medya yönetimi](/hizmetler/sosyal-medya-yonetimi) ve [Meta reklamları](/hizmetler/meta-tiktok-reklamlari) da yönettiği için siteye gelen trafiği de büyütebiliyoruz.",
          ],
        },
        {
          heading: "Adana web tasarım fiyatları",
          paragraphs: [
            "Fiyatı sayfa sayısı, özel tasarım, yönetim paneli, çoklu dil, e-ticaret ve içerik üretimi belirler. İhtiyacınızı dinledikten sonra gizli kalem içermeyen net bir teklif hazırlıyoruz. Kapsamın ayrıntıları [Kurumsal Web Tasarım](/hizmetler/web-sitesi-tasarimi) sayfamızda.",
          ],
        },
        {
          heading: "Adana'nın tüm ilçelerine hizmet",
          paragraphs: [
            "Seyhan, Çukurova, Yüreğir, Sarıçam, Ceyhan, Kozan ve diğer ilçelerdeki firmalarla çalışıyoruz. Mersin'deki işletmeler için [Mersin Web Tasarım](/mersin-web-tasarim) sayfamıza göz atabilirsiniz.",
          ],
        },
      ],
      faqs: [
        {
          q: "Adana'ya gelip yüz yüze görüşüyor musunuz?",
          a: "Gerektiğinde evet. Tarsus merkezliyiz ve Adana'ya yakınız. Görüşmelerin çoğunu online da yapabiliyoruz.",
        },
        {
          q: "Web sitesi ne kadar sürede hazır olur?",
          a: "Sayfa sayısına ve özelliklere göre değişir. Teslim tarihini işe başlamadan yazılı olarak veriyoruz.",
        },
        {
          q: "Alan adı ve hosting kimin adına olur?",
          a: "Alan adı ve tüm erişimler sizin adınıza olur. Mevcut alan adınız varsa onu kullanırız.",
        },
        {
          q: "E-ticaret sitesi de yapıyor musunuz?",
          a: "Evet. Ödeme, stok ve kargo altyapılı e-ticaret siteleri kuruyoruz. Ayrıntılar için [E-ticaret Çözümleri](/hizmetler/e-ticaret-cozumleri) sayfamıza bakabilirsiniz.",
        },
        {
          q: "Mevcut sitemi yenileyebilir misiniz?",
          a: "Evet. İçeriğinizi ve Google'daki sıralamalarınızı koruyarak sitenizi yeni tasarıma taşıyoruz.",
        },
      ],
    },
  },

  "mersin-sosyal-medya-ajansi": {
    slug: "mersin-sosyal-medya-ajansi",
    title: "Mersin Sosyal Medya Ajansı — Instagram ve Meta Reklamları",
    description:
      "Mersin sosyal medya ajansı FlixFlex: Instagram hesap yönetimi, içerik üretimi ve Meta reklamları tek ekipte. Mersin ve Tarsus'taki işletmeler için ücretsiz reklam incelemesi alın.",
    h1: "Mersin Sosyal Medya Ajansı",
    lead: "Mersin'deki işletmelerin Instagram, TikTok ve Facebook hesaplarını yönetiyor, içerikleri üretiyor ve Meta reklamlarıyla doğru kitleye ulaştırıyoruz.",
    serviceName: "Sosyal Medya Yönetimi ve Meta Reklamları",
    city: "Mersin",
    areaServed: ["Mersin", "Tarsus", "Mezitli", "Yenişehir", "Toroslar", "Akdeniz", "Erdemli", "Silifke"],
    guide: {
      eyebrow: "Mersin Sosyal Medya ve Reklam",
      sections: [
        {
          heading: "Mersin'de sosyal medya ajansı mı arıyorsunuz?",
          paragraphs: [
            "Mersin'de bir restoran, mağaza, klinik ya da e-ticaret markası işletiyorsanız müşterilerinizin büyük kısmı sizi önce Instagram'da görüyor. Hesabın düzenli, profesyonel ve güven veren görünmesi artık bir seçenek değil, satışın ilk adımı.",
            "FlixFlex, Tarsus merkezli bir reklam ve sosyal medya ajansı. Mersin'deki işletmeler için sosyal medya yönetimini ve Meta reklamlarını tek ekipte yürütüyoruz. İçeriği üreten ekip, reklamı kuran ekiple aynı masada oturuyor. Bu yüzden iyi giden içerik hemen reklama dönüşüyor.",
          ],
        },
        {
          heading: "Mersin'deki işletmeler için neler yapıyoruz?",
          bullets: [
            "Instagram hesap yönetimi: profil düzeni, içerik takvimi, paylaşım, yorum ve mesaj takibi.",
            "İçerik üretimi: Reels, carousel, hikâye tasarımları ve motion design videolar.",
            "Mersin Instagram reklamları: mesaj, arama ve satış getiren Meta reklamları; ilçe ve semt düzeyinde hedefleme.",
            "TikTok ve Facebook: genç kitle için TikTok, yerel ve 30 yaş üstü kitle için Facebook kampanyaları.",
            "Raporlama: aylık PDF yerine hangi içeriğin ve reklamın müşteri getirdiğini gösteren canlı panel.",
          ],
        },
        {
          heading: "Yerel reklamda konum hedeflemesi neden önemli?",
          paragraphs: [
            "Mersin'de hizmet veren bir işletmenin reklamını Türkiye'nin her yerine göstermek bütçeyi boşa harcar. Meta reklamlarında hedef kitleyi Mersin'in ilçelerine, hatta işletmenizin çevresindeki birkaç kilometrelik alana daraltabiliyoruz. Böylece reklam yalnızca size gelebilecek kişilere gösterilir.",
            "Yazın Erdemli ve Silifke sahillerine gelen ziyaretçiler, kışın şehir merkezindeki yoğunluk gibi Mersin'e özgü sezon hareketlerini de kampanya takvimine işliyoruz.",
          ],
        },
        {
          heading: "Çalıştığımız markalardan bazıları",
          paragraphs: [
            "Tarsus'tan Kurt Ofis için Meta reklamlarını, Filinta Kuruyemiş için Meta reklamları ve e-ticaret büyümesini, Özkan Batmaz Web Ajansı için sosyal medya ve reklam yönetimini yürütüyoruz. Tüm projelere [portfolyo](/portfolio) sayfamızdan göz atabilirsiniz.",
          ],
        },
        {
          heading: "Çalışma şeklimiz",
          bullets: [
            "Şablon yok: her markanın içerik dili ve reklam stratejisi ayrı kurulur.",
            "Hızlı dönüş: sorularınıza aynı gün cevap veriyoruz.",
            "Esnek paketler: aylık, 3, 6 ve 12 aylık seçenekler.",
            "Yazılı teslim sözü: söz verdiğimiz işi zamanında teslim etmezsek o ayın ücretini almıyoruz.",
          ],
          paragraphs: [
            "Hizmetlerin ayrıntıları için [Sosyal Medya Yönetimi](/hizmetler/sosyal-medya-yonetimi) ve [Meta ve TikTok Reklamları](/hizmetler/meta-tiktok-reklamlari) sayfalarımıza bakabilirsiniz.",
          ],
        },
      ],
      faqs: [
        {
          q: "Mersin'de yüz yüze çalışıyor musunuz?",
          a: "Evet. Tarsus merkezliyiz ve Mersin'deki işletmelerle gerektiğinde yüz yüze görüşüyoruz.",
        },
        {
          q: "Sadece Instagram reklamı yaptırabilir miyim?",
          a: "Evet. Sosyal medya yönetimi almadan yalnızca Meta reklam yönetimi hizmeti de alabilirsiniz.",
        },
        {
          q: "Reklam bütçesi ücrete dahil mi?",
          a: "Hayır. Reklam bütçesi kendi kartınızla doğrudan Meta'ya ödenir. Biz yalnızca yönetim hizmeti için ücret alırız.",
        },
        {
          q: "Ne zaman sonuç alırım?",
          a: "Reklamlarda ilk sonuçlar genellikle birkaç hafta içinde netleşir, organik büyüme ise birkaç ay sürer. Sonuçlar sektöre ve bütçeye göre değiştiği için kesin rakam vaat etmiyoruz.",
        },
        {
          q: "Ücretsiz inceleme nasıl işliyor?",
          a: "Mevcut hesabınıza ve reklamlarınıza 20 dakika birlikte bakıyoruz. İşinize yarayacak bir şey bulamazsak kahveniz bizden.",
        },
      ],
    },
  },
}
