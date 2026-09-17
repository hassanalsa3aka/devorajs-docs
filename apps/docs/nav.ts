import type { NavLink } from "@devorajs/core";

// One shared nav definition, reused by every route in this app — explicit,
// not guessed from the app name inside the shared header component.
// Individual doc pages are grouped in DocsLayout's sidebar (see
// docs-layout.tsx), not listed here — this stays a flat, short list since
// AppHeader only renders NavLink[] as plain links, no dropdowns.
export const DOCS_NAV: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Docs", href: "/getting-started" },
  { label: "Search", href: "#search-overlay" },
];
