/**
 * Site-wide CSS on top of @devorajs/core's theme (0.3.2), included once per
 * page through SiteFooter (see its note on dangerouslySetInnerHTML). Three jobs:
 *
 * 1. The manual light/dark switch (theme-toggle.js sets data-theme on
 *    <html>). Each block repeats the framework's own token values for that
 *    scheme, so a page looks the same whether it got there through the OS
 *    preference or the switch. 0.3.2 added tokens (surface, header-bg,
 *    fg-subtle, border-strong, ring, hover, shadow-sm); a block that only
 *    set the older ones left the header and inputs in the other scheme.
 * 2. `--devora-bg-elevated`, which this site's components use and 0.3.2's
 *    theme no longer defines (it became `--devora-surface`).
 * 3. The site's own look where 0.3.2's shell restyled shared elements:
 *    a full-width header and footer, h2 with the gradient bar instead of an
 *    underline, cards with the accent
 *    top border, and code blocks inside a card drawn once, not as a box in
 *    a box.
 */
const DARK = `
  --devora-bg: #0b0b12;
  --devora-surface: #11111a;
  --devora-header-bg: rgba(17, 17, 26, 0.85);
  --devora-card: #15151f;
  --devora-fg: #f4f4f6;
  --devora-fg-muted: #a6a6b8;
  --devora-fg-subtle: #8a8a9e;
  --devora-border: #262633;
  --devora-border-strong: #383850;
  --devora-accent-from: #3b82f6;
  --devora-accent-to: #a855f7;
  --devora-link: #93b8ff;
  --devora-ring: rgba(120, 160, 255, 0.55);
  --devora-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.45);
  --devora-shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.28);
  --devora-hover: rgba(255, 255, 255, 0.06);
  color-scheme: dark;
`;

const LIGHT = `
  --devora-bg: #f7f7fa;
  --devora-surface: #ffffff;
  --devora-header-bg: rgba(255, 255, 255, 0.88);
  --devora-card: #ffffff;
  --devora-fg: #15151e;
  --devora-fg-muted: #4c4c5c;
  --devora-fg-subtle: #646475;
  --devora-border: #e3e3eb;
  --devora-border-strong: #cdcdd9;
  --devora-accent-from: #2563eb;
  --devora-accent-to: #9333ea;
  --devora-link: #1d4ed8;
  --devora-ring: rgba(37, 99, 235, 0.45);
  --devora-shadow-sm: 0 1px 2px rgba(20, 20, 40, 0.06);
  --devora-shadow: 0 1px 2px rgba(20, 20, 40, 0.05), 0 8px 24px rgba(20, 20, 40, 0.07);
  --devora-hover: rgba(20, 20, 40, 0.05);
  color-scheme: light;
`;

export const SITE_THEME_CSS = `
  :root { --devora-bg-elevated: var(--devora-surface); }
  :root[data-theme=light] {${LIGHT}}
  :root[data-theme=dark] {${DARK}}

  /* The framework caps the header and footer at 1120px (--devora-wide-width). This site uses 1280px, so the
     logo and nav line up with the widest pages and do not drift to the screen edges on a 1920px or 2560px display. */
  .devora-header-inner, .devora-footer-inner { max-width: 1280px; }

  .devora-page h2 {
    position: relative;
    margin: 2.75rem 0 1rem;
    padding: 0 0 0 1rem;
    border-bottom: 0;
    font-size: 1.375rem;
    letter-spacing: -0.005em;
  }
  .devora-page h2:first-of-type { margin-top: 1.75rem; }
  .devora-page h2::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.15em;
    bottom: 0.15em;
    width: 3px;
    border-radius: 2px;
    background: linear-gradient(180deg, var(--devora-accent-from), var(--devora-accent-to));
  }

  .devora-card {
    border-top: 2px solid var(--devora-accent-from);
    margin: 1.25rem 0 1.5rem;
  }
  .devora-page pre { font-size: 0.85rem; }
  .devora-card > pre {
    margin: 0;
    padding: 0;
    background: none;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  /* Phones: nothing under 12px (tags, table headers, code in tables, small notes). */
  @media (max-width: 640px) {
    .devora-page .tag, .docs-sidebar-label { font-size: 0.75rem; }
    .devora-page table th, .devora-page thead th { font-size: 0.75rem; }
    .devora-page td code, .devora-page th code, .devora-page li code, .devora-page small, .devora-page small code { font-size: 0.8125rem; }
    .devora-page small { font-size: 0.75rem; }
    .devora-page code { font-size: max(0.78rem, 0.875em); }
    .devora-page .cc-mark { font-size: 0.75rem; }
  }
`;
