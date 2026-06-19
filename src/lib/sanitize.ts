// ═══════════════════════════════════════════════════════════
// FlixFlex — HTML Sanitization
//
// Centralised DOMPurify wrapper for any value rendered as raw HTML.
// Page-builder rich text and similar admin-authored HTML is only
// semi-trusted: a lower-privileged role (e.g. Graphic Designer with
// pages:update) could otherwise inject a script tag that becomes
// stored XSS for every visitor.
//
// `isomorphic-dompurify` runs in both the Node SSR pass and the
// browser, so this is safe to call from client components too.
// ═══════════════════════════════════════════════════════════

import DOMPurify from "isomorphic-dompurify"

/**
 * Sanitize an untrusted/semi-trusted HTML string for safe injection.
 * Strips script tags, inline event handlers, javascript: URLs, etc.
 * while preserving the formatting tags rich-text content relies on.
 */
export function sanitizeHtml(dirty: string | undefined | null): string {
  if (!dirty) return ""
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    // Allow target/rel on links (used by admin content); DOMPurify
    // still neutralises javascript: and data: script vectors.
    ADD_ATTR: ["target", "rel"],
  })
}
