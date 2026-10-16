// One place for everything search engines and link previews read, so each
// route only states its own path, title, and description.
//
// The framework's <head> renders title, description, and
// og:title/description/type/image/url. Since @devorajs/core 0.3.2 a route's
// meta() can add its own tags through `head`, which is how every page gets
// a canonical link and a twitter:card below; <html lang> is set once in
// app.config.ts.

export const SITE_URL = "https://devorajs-docs-docs.vercel.app";
export const SITE_NAME = "Devora.js";
// 1200x630, the size every major link-preview renderer expects.
export const OG_IMAGE = `${SITE_URL}/og/devorajs-og.png`;

/**
 * meta() return value for a route. `title` is the page's own name; it gets
 * a " — Devora.js docs" suffix in the browser tab / search result unless
 * `fullTitle` is given (pages whose title already names the product).
 * `image` is a path under assets/ ("/og/examples.png") for a page's own card.
 */
export function pageMeta(path, { title, description, fullTitle = undefined, type = "article", image = undefined }) {
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;
  return {
    title: fullTitle ?? `${title} — Devora.js docs`,
    description,
    head: {
      // site-header.css styles the nav before it paints (see that file). It
      // is added here, per page, rather than in app.config.ts's head: route
      // code reloads in `devora dev`, app.config.ts only at boot.
      links: [{ rel: "canonical", href: url }, { rel: "stylesheet", href: "/css/site-header.css" }],
      meta: [{ name: "twitter:card", content: "summary_large_image" }],
      // Phone and tablet menus (header burger, docs menu). Classic and tiny, so the class it sets is there before paint.
      scripts: [{ src: "/js/menu-toggle.js", type: "classic" }],
    },
    og: {
      title: fullTitle ?? title,
      description,
      type: path === "/" ? "website" : type,
      url,
      // A page card from scripts/og-cards.sh, or the site-wide one.
      image: image ? `${SITE_URL}${image}` : OG_IMAGE,
    },
  };
}

/**
 * Structured data (schema.org JSON-LD). A data block, not a script: it's
 * never executed, so the CSP's script-src doesn't apply to it. "<" is
 * escaped so no string inside can close the tag early.
 */
export function JsonLd({ data }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

/** Breadcrumb + article markup for a docs page (rendered by DocsLayout). */
export function docsPageJsonLd({ path, label }) {
  const url = `${SITE_URL}${path}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: `${SITE_NAME} docs`, item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: label, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: label,
      url,
      image: OG_IMAGE,
      inLanguage: "en",
      isPartOf: { "@type": "WebSite", name: `${SITE_NAME} docs`, url: `${SITE_URL}/` },
      about: { "@type": "SoftwareSourceCode", name: SITE_NAME },
    },
  ];
}
