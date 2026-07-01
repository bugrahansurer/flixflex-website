// ═══════════════════════════════════════════════════════════
// FlixFlex — Third-party marketing pixels (GA4 / GTM / Meta Pixel)
//
// Injected into the public site ONLY when the corresponding ID is set
// in Ayarlar → Entegrasyonlar. IDs are validated against strict formats
// before injection so a malformed / malicious settings value can never
// break out of the inline script. These fire for the ad platforms;
// our own dashboard/report numbers come from first-party tracking.
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
  const ga = gaId && GA_RE.test(gaId) ? gaId : null
  const gtm = gtmId && GTM_RE.test(gtmId) ? gtmId : null
  const pixel = pixelId && PIXEL_RE.test(pixelId) ? pixelId : null

  return (
    <>
      {/* ── Google Analytics 4 (gtag.js) ── */}
      {ga && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ff-ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}',{send_page_view:true});`}
          </Script>
        </>
      )}

      {/* ── Google Tag Manager ── */}
      {gtm && (
        <Script id="ff-gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
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
