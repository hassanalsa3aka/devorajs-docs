import { SITE_THEME_CSS } from "./site-theme.js";

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;

const FOOTER_COLUMNS = [
  {
    title: "Docs",
    links: [
      { label: "Getting started", href: "/getting-started" },
      { label: "Build a multi-app project", href: "/multi-app-tutorial" },
      { label: "API reference", href: "/api-reference" },
      { label: "Deployment", href: "/deployment" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "Examples", href: "/examples" },
      { label: "Blog", href: "/blog" },
      { label: "Compare", href: "/compare" },
      { label: "Performance", href: "/performance" },
      { label: "Roadmap", href: "/roadmap" },
      { label: "Upgrading to 0.3.4", href: "/upgrading" },
      { label: "Changelog", href: "https://github.com/hassanalsa3aka/devora.js/blob/main/CHANGELOG.md" },
      { label: "npm packages", href: "https://www.npmjs.com/package/@devorajs/core" },
    ],
  },
  {
    title: "Source",
    links: [
      { label: "devora.js on GitHub", href: "https://github.com/hassanalsa3aka/devora.js" },
      { label: "These docs on GitHub", href: "https://github.com/hassanalsa3aka/devorajs-docs" },
      { label: "Report an issue", href: "https://github.com/hassanalsa3aka/devora.js/issues" },
    ],
  },
];

const ICON_GITHUB = (
  <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
);
const ICON_DISCORD = (
  <path d="M20.32 4.37A19.8 19.8 0 0 0 15.4 2.9l-.62 1.27a18.3 18.3 0 0 0-5.56 0L8.6 2.9a19.7 19.7 0 0 0-4.92 1.47C.57 9.05-.27 13.6.15 18.1a19.9 19.9 0 0 0 6.03 3.05l1.3-2.13a12.9 12.9 0 0 1-2.05-.98l.5-.39a14.2 14.2 0 0 0 12.14 0l.5.39c-.65.39-1.34.72-2.05.98l1.3 2.13a19.8 19.8 0 0 0 6.03-3.05c.5-5.2-.84-9.72-3.53-13.73zM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42s.95-2.42 2.16-2.42c1.2 0 2.18 1.09 2.16 2.42 0 1.33-.96 2.42-2.16 2.42zm7.97 0c-1.19 0-2.16-1.09-2.16-2.42s.95-2.42 2.16-2.42c1.2 0 2.17 1.09 2.16 2.42 0 1.33-.95 2.42-2.16 2.42z" />
);
const ICON_X = <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />;

const SOCIAL = [
  { label: "devora.js on GitHub", href: "https://github.com/hassanalsa3aka/devora.js", icon: ICON_GITHUB },
  { label: "Devora.js Discord", href: "https://discord.gg/wYFYmFxdS8", icon: ICON_DISCORD },
  { label: "Updates on X", href: "https://x.com/hassansayed2002", icon: ICON_X },
];

// Every <style> on this site is written with dangerouslySetInnerHTML: as a
// text child, React HTML-escapes it (" becomes &quot;, > becomes &gt;),
// which silently drops any rule with a quoted string or a child combinator.
// The CSS is static, never user input.
export function SiteFooter() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `${SITE_THEME_CSS}
        /* Footer: brand column + three link columns, then a legal row. */
        .devora-footer-inner { padding-top: 3rem; padding-bottom: 1.5rem; gap: 2rem; }
        .devora-footer-custom { display: block; }
        .site-footer {
          display: grid;
          grid-template-columns: minmax(14rem, 1.4fr) repeat(3, minmax(9rem, 1fr));
          gap: 2.5rem 2rem;
        }
        .site-footer-brand { display: flex; flex-direction: column; gap: 0.85rem; max-width: 22rem; }
        .site-footer-logo {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--devora-fg);
          text-decoration: none;
        }
        .site-footer-logo img { width: 26px; height: 26px; }
        .site-footer-logo span span {
          background: linear-gradient(90deg, var(--devora-accent-from), var(--devora-accent-to));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .site-footer-tagline { margin: 0; font-size: 0.875rem; line-height: 1.6; color: var(--devora-fg-muted); }
        .site-footer-social { display: flex; gap: 0.5rem; }
        .site-footer-social a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid var(--devora-border);
          color: var(--devora-fg-muted);
          transition: color 0.15s, border-color 0.15s, background-color 0.15s;
        }
        .site-footer-social a:hover { color: var(--devora-fg); border-color: var(--devora-accent-from); background: var(--devora-hover); }
        .site-footer-social svg { width: 17px; height: 17px; fill: currentColor; }
        .site-footer-col h2 {
          margin: 0 0 0.85rem;
          padding: 0;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--devora-fg);
          border: 0;
        }
        .devora-page .site-footer-col h2::before, .site-footer-col h2::before { content: none; }
        .site-footer-col ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.55rem; }
        .site-footer-col a, .site-footer-legal a {
          color: var(--devora-fg-muted);
          text-decoration: none;
          font-size: 0.875rem;
        }
        .site-footer-col a:hover, .site-footer-legal a:hover { color: var(--devora-fg); text-decoration: underline; }
        .site-footer-legal {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 0.5rem 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--devora-border);
          font-size: 0.8rem;
          color: var(--devora-fg-subtle);
        }
        .site-footer-legal a { font-size: 0.8rem; }
        .site-footer-copy { justify-self: start; }
        .site-footer-built { justify-self: center; text-align: center; }
        .site-footer-meta { justify-self: end; display: flex; gap: 1.25rem; }
        .site-footer-copy a { color: var(--devora-fg); }
        /* Links inside a sentence: no underline; told apart from the text by a
           brighter color and a heavier weight, underlined on hover/focus. */
        .site-footer-copy a, .site-footer-built a { color: var(--devora-fg); font-weight: 600; text-decoration: none; }
        .site-footer-copy a:hover, .site-footer-built a:hover,
        .site-footer-copy a:focus-visible, .site-footer-built a:focus-visible { text-decoration: underline; text-underline-offset: 3px; }
        @media (max-width: 700px) {
          .site-footer-legal { grid-template-columns: 1fr; justify-items: start; }
          .site-footer-built { justify-self: start; text-align: left; }
          .site-footer-meta { justify-self: start; }
        }
        .devora-footer-row { display: none; }
        @media (max-width: 900px) {
          .site-footer { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .site-footer-brand { grid-column: 1 / -1; max-width: none; }
        }
        @media (max-width: 560px) {
          .site-footer { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2rem 1.5rem; }
        }

        /* Consent banner — created by assets/js/analytics.js, only when GA
           is configured and the visitor hasn't chosen yet. */
        .consent-banner {
          position: fixed;
          left: 1rem;
          right: 1rem;
          bottom: 1rem;
          z-index: 50;
          max-width: 40rem;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 1rem 1.25rem;
          padding: 1rem 1.15rem;
          background: var(--devora-bg-elevated);
          border: 1px solid var(--devora-border);
          border-radius: calc(var(--devora-radius) + 4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
        }
        .consent-banner-text {
          margin: 0;
          font-size: 0.85rem;
          line-height: 1.55;
          color: var(--devora-fg-muted);
        }
        .consent-banner-text a { color: var(--devora-link); }
        .consent-banner-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
        .consent-btn {
          font: inherit;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          cursor: pointer;
          border: 1px solid var(--devora-border);
          background: transparent;
          color: var(--devora-fg);
        }
        .consent-btn:hover { border-color: var(--devora-accent-from); }
        .consent-btn-primary {
          border-color: transparent;
          color: white;
          background: linear-gradient(90deg, var(--devora-accent-from), var(--devora-accent-to));
        }
        .consent-btn:focus-visible { outline: 2px solid var(--devora-accent-from); outline-offset: 2px; }
        @media (max-width: 560px) {
          .consent-banner { flex-direction: column; align-items: stretch; }
          .consent-banner-actions .consent-btn { flex: 1; }
        }

        /* Explicit light/dark override — wins over the framework's own
           prefers-color-scheme default regardless of OS setting, driven by
           theme-toggle.js setting data-theme on <html> and persisting the
           choice to localStorage. Values mirror THEME_CSS's own media-query
           block exactly, so a page looks identical whether it got there via
           OS preference or this manual switch. */
        :root[data-theme=light] {
          --devora-bg: #fafafc;
          --devora-bg-elevated: #ffffff;
          --devora-card: #ffffff;
          --devora-fg: #16161f;
          --devora-fg-muted: #5c5c6b;
          --devora-border: #e6e6ee;
          --devora-accent-from: #2563eb;
          --devora-accent-to: #9333ea;
          --devora-link: #2563eb;
          --devora-shadow: 0 1px 2px rgba(20, 20, 40, 0.04), 0 8px 24px rgba(20, 20, 40, 0.06);
        }
        :root[data-theme=dark] {
          --devora-bg: #0a0a12;
          --devora-bg-elevated: #13131f;
          --devora-card: #15151f;
          --devora-fg: #f5f5f7;
          --devora-fg-muted: #9d9db0;
          --devora-border: #26262f;
          --devora-accent-from: #3b82f6;
          --devora-accent-to: #a855f7;
          --devora-link: #93c5fd;
          --devora-shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.25);
        }

        .search-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 200;
          align-items: flex-start;
          justify-content: center;
          padding: 8vh 1.5rem 1.5rem;
          background: rgba(5, 5, 10, 0.75);
          backdrop-filter: blur(4px);
          overflow-y: auto;
        }
        .search-overlay:target { display: flex; }
        .search-overlay-box {
          position: relative;
          width: 100%;
          max-width: 40rem;
          background: var(--devora-bg-elevated);
          border: 1px solid var(--devora-border);
          border-radius: 14px;
          box-shadow: var(--devora-shadow);
          padding: 1.5rem;
        }
        .search-overlay-close {
          position: absolute;
          top: -2.75rem;
          right: 0;
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 50%;
          background: var(--devora-bg-elevated);
          border: 1px solid var(--devora-border);
          color: var(--devora-fg);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-size: 1.1rem;
        }
        .search-overlay-close:hover { border-color: var(--devora-accent-from); }
        .search-overlay-hint {
          margin: 0.85rem 0 0;
          font-size: 0.75rem;
          color: var(--devora-fg-muted);
          text-align: center;
        }
        #search-overlay-pf {
          --pagefind-ui-primary: var(--devora-accent-from);
          --pagefind-ui-text: var(--devora-fg);
          --pagefind-ui-background: var(--devora-bg-elevated);
          --pagefind-ui-border: var(--devora-border);
          --pagefind-ui-tag: var(--devora-bg);
        }
        #search-overlay-pf .pagefind-ui__search-input {
          background: var(--devora-bg);
          border: 1px solid var(--devora-border);
          color: var(--devora-fg);
          font-size: 1rem;
        }
        #search-overlay-pf .pagefind-ui__search-clear {
          top: 0.6rem;
          right: 0.6rem;
          height: 2rem;
          padding: 0 0.75rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--devora-fg-muted);
          background: transparent;
          border: 1px solid transparent;
          border-radius: 999px;
          transition: color 0.15s, background-color 0.15s, border-color 0.15s;
        }
        #search-overlay-pf .pagefind-ui__search-clear:hover {
          color: var(--devora-fg);
          background: var(--devora-bg);
          border-color: var(--devora-border);
        }
        #search-overlay-pf .pagefind-ui__result { border-bottom: 1px solid var(--devora-border); }
        #search-overlay-pf .pagefind-ui__result-title a { color: var(--devora-fg); }
        #search-overlay-pf .pagefind-ui__result-excerpt { color: var(--devora-fg-muted); }
        #search-overlay-pf .pagefind-ui__result-excerpt mark {
          background: transparent;
          color: var(--devora-link);
          font-weight: 600;
        }
      ` }} />
      <div className="site-footer">
        <div className="site-footer-brand">
          <a href="/" className="site-footer-logo">
            <img src="/icons/devorajs-logo-withoutbg.png" alt="" width={26} height={26} />
            <span>
              devora<span>.js</span>
            </span>
          </a>
          <p className="site-footer-tagline">
            A Vite-based React framework for projects with more than one app: one shared backend,
            one login, each app deployed on its own.
          </p>
          <div className="site-footer-social">
            {SOCIAL.map((s) => (
              <a key={s.href} href={s.href} aria-label={s.label} title={s.label} {...EXTERNAL}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{s.icon}</svg>
              </a>
            ))}
          </div>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <nav className="site-footer-col" aria-label={col.title} key={col.title}>
            <h2>{col.title}</h2>
            <ul>
              {col.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} {...(link.href.startsWith("http") ? EXTERNAL : {})}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="site-footer-legal">
          <span className="site-footer-copy">
            © 2026{" "}
            <a href="https://www.hassansayed.dev" {...EXTERNAL}>
              Hassan Sayed
            </a>{" "}
            · MIT License
          </span>
          <span className="site-footer-built">
            Built with <a href="https://github.com/hassanalsa3aka/devora.js" {...EXTERNAL}>devora.js</a>
          </span>
          <span className="site-footer-meta">
            <a href="/privacy">Privacy</a>
            {/* Handled by assets/js/analytics.js — reopens the consent banner. */}
            <a href="#cookie-settings">Cookie settings</a>
          </span>
        </div>
      </div>

      <div id="search-overlay" className="search-overlay">
        <div className="search-overlay-box">
          <a href="#" className="search-overlay-close" aria-label="Close search">
            ×
          </a>
          <div id="search-overlay-pf" />
          <p className="search-overlay-hint">⌘K on Mac, Ctrl+K on Windows/Linux — or just click Search anytime.</p>
        </div>
      </div>
      <script src="/js/search-overlay.js" />
      <script src="/js/theme-toggle.js" />
      <script src="/js/analytics.js" />
    </>
  );
}
