const FOOTER_LINKS = [
  { label: "Getting started", href: "/getting-started" },
  { label: "Docs home", href: "/" },
  { label: "GitHub — devora.js", href: "https://github.com/hassanalsa3aka/devora.js" },
  { label: "GitHub — docs", href: "https://github.com/hassanalsa3aka/devorajs-docs" },
];

export function SiteFooter() {
  return (
    <>
      <style>{`
        .site-footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem 1.25rem;
        }
        .site-footer-copy a,
        .site-footer-links a {
          color: var(--devora-link, inherit);
          text-decoration: none;
        }
        .site-footer-copy a:hover,
        .site-footer-links a:hover {
          text-decoration: underline;
        }
        .devora-nav a:last-child {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          border: 1px solid var(--devora-border);
          border-radius: 8px;
          padding: 0.3rem 0.6rem;
        }
        .devora-nav a:last-child:hover { border-color: var(--devora-accent-from); }
        .devora-nav a:last-child::before {
          content: var(--pseudo-content);
          display: inline-block;
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          background-color: currentColor;
          -webkit-mask-image: var(--search-icon);
          mask-image: var(--search-icon);
          -webkit-mask-size: contain;
          mask-size: contain;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-position: center;
          mask-position: center;
        }
        .devora-header-left { width: 100%; }
        .devora-nav { margin-left: auto; }

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
      `}</style>
      <span className="site-footer-copy">
        © 2026{" "}
        <a href="https://www.hassansayed.dev" target="_blank" rel="noopener noreferrer">
          Hassan Sayed
        </a>
      </span>
      <nav className="site-footer-links" aria-label="Footer">
        {FOOTER_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            {...(link.href.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {link.label}
          </a>
        ))}
      </nav>

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
    </>
  );
}
