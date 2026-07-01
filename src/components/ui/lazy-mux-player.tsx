"use client"

import dynamic from "next/dynamic"

// Ağır MuxPlayer (+ hls.js) yalnızca gerçekten render edildiğinde yüklenir.
// Böylece video içermeyen sayfaların public JS bundle'ına girmez.
// ssr:false: video zaten client-side hydrate olur; poster mount'ta gelir.
const LazyMuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
})

export default LazyMuxPlayer
