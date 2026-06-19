import Mux from "@mux/mux-node"

const muxTokenId     = process.env.MUX_TOKEN_ID
const muxTokenSecret = process.env.MUX_TOKEN_SECRET

if (!muxTokenId || !muxTokenSecret) {
  if (process.env.NODE_ENV === "development") {
    console.warn("⚠️ [MUX] MUX_TOKEN_ID or MUX_TOKEN_SECRET is missing. Video uploads will fail.")
  }
}

export const mux = new Mux({
  tokenId:     muxTokenId || "MISSING",
  tokenSecret: muxTokenSecret || "MISSING",
})

export const { video } = mux
