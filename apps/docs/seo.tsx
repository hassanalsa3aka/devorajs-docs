// One place for everything search engines and link previews read, so each
// route only states its own path, title, and description.
//
// The framework's <head> (packages/core html.ts) renders title,
// description, and og:title/description/type/image/url — nothing else. No
// canonical link, twitter:card, or <html lang> yet; those need a
// framework change, not something a route can add.

export const SITE_URL = "https://devorajs-docs-docs.vercel.app";
export const SITE_NAME = "Devora.js";
// 1200x630, the size every major link-preview renderer expects.
export const OG_IMAGE = `${SITE_URL}/og/devorajs-og.png`;

/**
 * meta() return value for a route. `title` is the page's own name; it gets
 * a " — Devora.js docs" suffix in the browser tab / search result unless
 * `fullTitle` is given (pages whose title already names the product).
 */
export function pageMeta(path, { title, description, fullTitle = undefined, type = "article" }) {
  return {
    title: fullTitle ?? `${title} — Devora.js docs`,
    description,
    og: {
      title: fullTitle ?? title,
      description,
      type: path === "/" ? "website" : type,
      url: `${SITE_URL}${path === "/" ? "/" : path}`,
      image: OG_IMAGE,
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
