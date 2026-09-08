import type { NavLink } from "@devorajs/core";

// One shared nav definition, reused by every route in this app — explicit,
// not guessed from the app name inside the shared header component.
export const DOCS_NAV: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Getting started", href: "/getting-started" },
  { label: "Core concepts", href: "/core-concepts" },
  { label: "Render modes", href: "/render-modes" },
  { label: "CLI reference", href: "/cli-reference" },
  { label: "Deployment", href: "/deployment" },
  { label: "Security", href: "/security" },
];
