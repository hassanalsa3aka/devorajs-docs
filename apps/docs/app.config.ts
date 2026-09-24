import { defineApp } from "@devorajs/core/config";

export default defineApp({
  defaultRenderMode: "ssr",
  // This is a public-facing docs site, so opt in — sitemap.xml helps search
  // engines discover every page (opt-in/off by default for internal apps).
  sitemap: true,
  security: {
    // Same as the framework default, plus the two allowances Pagefind
    // (build-time search, see /search overlay) actually needs:
    //   - script-src 'wasm-unsafe-eval': Pagefind's search index runs as a
    //     WebAssembly module. Confirmed directly — without this, the
    //     default CSP blocks WebAssembly.instantiate() outright and the
    //     search box silently returns zero results for every query, with
    //     no visible error unless devtools is open. 'wasm-unsafe-eval' only
    //     allows WASM compilation; it does NOT allow eval()/Function()/
    //     string-based setTimeout the way the broader 'unsafe-eval' would,
    //     so this doesn't touch the "no dynamic eval" security posture.
    //   - img-src data:: Pagefind's default UI renders its search/clear
    //     icons as inline data: URI SVGs, which default-src's fallback
    //     otherwise blocks (cosmetic-only breakage, but real).
    // Plus Google Analytics 4 (assets/js/analytics.js), using exactly the
    // hosts Google's CSP guide lists for GA4: gtag.js from
    // googletagmanager.com, measurement hits to google-analytics.com /
    // analytics.google.com (fetch/sendBeacon → connect-src, pixel fallback
    // → img-src). Vercel Web Analytics needs nothing extra: its script and
    // endpoint are same-origin (/_vercel/insights/*), covered by 'self'.
    csp:
      "default-src 'self'; " +
      "script-src 'self' 'wasm-unsafe-eval' https://*.googletagmanager.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com; " +
      "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; " +
      "object-src 'none'; base-uri 'self'",
  },
});
