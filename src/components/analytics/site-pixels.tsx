// ═══════════════════════════════════════════════════════════
// FlixFlex — Third-party marketing pixels (GA4 / GTM / Meta Pixel)
//
// GTM + Consent Mode "beforeInteractive" ile SUNUCUDA HTML'e render edilir;
// böylece GTM'in "Test Et" (sunucu-fetch) doğrulaması etiketi tanır ve
// script'ler erken çalışır. ID'ler enjeksiyondan önce katı formata karşı
// doğrulanır — bozuk/zararlı bir ayar değeri snippet'ten kaçamaz.
//
// Google Consent Mode v2: varsayılan izin "denied"; çerez banner'ı
// (CookieConsent) kabul edilince gtag('consent','update', granted) çağırır.
// Böylece GTM/GA yüklenir + tespit edilir ama izin verilene kadar çerezsiz
// (cookieless) çalışır.
// ═══════════════════════════════════════════════════════════

import Script from "next/script"

const GA_RE = /^(G-[A-Z0-9]{4,20}|UA-\d{4,12}-\d{1,4})$/i
const GTM_RE = /^GTM-[A-Z0-9]{4,12}$/i
const PIXEL_RE = /^\d{6,20}$/

interface SitePixelsProps {
  gaId?: string
  gtmId?: string
  pixelId?: string
}

export function SitePixels({ gaId, gtmId, pixelId }: SitePixelsProps) {
  // Ayar değerleri kopyala-yapıştırla baştaki/sondaki boşluk içerebilir
  // (ör. " GTM-PBLDVMD2"). Doğrulamadan önce trim et — aksi halde regex
  // başarısız olur ve etiket HİÇ enjekte edilmez.
  const gaClean = gaId?.trim()
  const gtmClean = gtmId?.trim()
  const pixelClean = pixelId?.trim()

  const ga = gaClean && GA_RE.test(gaClean) ? gaClean : null
  const gtm = gtmClean && GTM_RE.test(gtmClean) ? gtmClean : null
  const pixel = pixelClean && PIXEL_RE.test(pixelClean) ? pixelClean : null

  if (!ga && !gtm && !pixel) return null

  return (
    <>
      {/* ── Consent Mode v2 varsayılanı — tüm etiketlerden ÖNCE ── */}
      <Script id="ff-consent-default" strategy="beforeInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}` +
          `var _c=(document.cookie.match(/(?:^|; )ff_cookie_consent=([^;]+)/)||[])[1];` +
          `var _g=_c==='accepted'?'granted':'denied';` +
          `gtag('consent','default',{ad_storage:_g,analytics_storage:_g,ad_user_data:_g,ad_personalization:_g,wait_for_update:500});`}
      </Script>

      {/* ── Google Tag Manager (standart snippet, sunucuda render) ── */}
      {gtm && (
        <>
          <Script id="ff-gtm" strategy="beforeInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm"
            />
          </noscript>
        </>
      )}

      {/* ── Google Analytics 4 (gtag.js) ── */}
      {ga && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ff-ga4-init" strategy="afterInteractive">
            {`gtag('js',new Date());gtag('config','${ga}',{send_page_view:true});`}
          </Script>
        </>
      )}

      {/* ── Meta (Facebook) Pixel ── */}
      {pixel && (
        <>
          <Script id="ff-meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${pixel}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
    </>
  )
}
