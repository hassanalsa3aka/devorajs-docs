import type { NavLink } from "@devorajs/core";

// One shared nav definition, reused by every route in this app — explicit,
// not guessed from the app name inside the shared header component.
// Individual doc pages are grouped in DocsLayout's sidebar (see
// docs-layout.tsx), not listed here — this stays a flat, short list since
// AppHeader only renders NavLink[] as plain links, no dropdowns. The logo
// links home. Search, GitHub, Discord and Theme are styled as icon buttons
// by href in site-footer.tsx.
export const DOCS_NAV: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Docs", href: "/getting-started" },
  { label: "Examples", href: "/examples" },
  { label: "Blog", href: "/blog" },
  { label: "Compare", href: "/compare" },
  { label: "Performance", href: "/performance" },
  { label: "Search", href: "#search-overlay" },
  { label: "GitHub", href: "https://github.com/hassanalsa3aka/devora.js" },
  { label: "Discord", href: "https://discord.gg/wYFYmFxdS8" },
  { label: "Theme", href: "#theme" },
];
