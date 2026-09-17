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
    csp: "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'",
  },
});
