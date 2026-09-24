import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import {
  CompareTable,
  COMPARE_TABLE_CSS,
  LOGO_DEVORA,
  LOGO_NEXTJS,
  LOGO_NX,
  LOGO_REACT,
  LOGO_TURBOREPO,
} from "../compare-table.js";
import { JsonLd, pageMeta, OG_IMAGE, SITE_URL } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/", {
    title: "Devora.js — security-first, multi-app by default",
    fullTitle: "Devora.js — security-first, multi-app web framework",
    description:
      "A lightweight, Vite-based web framework whose headline feature is native multi-app support — one project, multiple sites, sharing a core, deployable independently.",
  });
}

function getCoreVersion() {
  try {
    const require = createRequire(import.meta.url);
    let dir = dirname(require.resolve("@devorajs/core"));
    for (let i = 0; i < 5; i++) {
      try {
        const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf-8"));
        if (pkg.name === "@devorajs/core") return pkg.version;
      } catch {
        // keep walking up
      }
      dir = dirname(dir);
    }
  } catch {
    // package not resolvable; fall through
  }
  return null;
}

export async function loader() {
  return { version: getCoreVersion() };
}

const FEATURES = [
  {
    title: "Multi-app, first-class",
    body: "Marketing site, product app, and admin panel live side by side in one project, sharing a core — not bolted together with a separate monorepo tool.",
    icon: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </>
    ),
  },
  {
    title: "Explicit over implicit",
    body: "Render mode, data loading, and server/client boundaries are declared right in the route file — nothing caches on a schedule you didn't write down.",
    icon: (
      <>
        <path d="M8 6 3 12l5 6" />
        <path d="M16 6l5 6-5 6" />
      </>
    ),
  },
  {
    title: "Security by default",
    body: "CSP and HSTS headers, CSRF checks, and revocable server-side sessions (opaque IDs, never your data in a cookie) are on for every app out of the box — you opt out, not in.",
    icon: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />,
  },
  {
    title: "Bring your own backend",
    body: "One shared backend for server functions and your DB client of choice — no built-in ORM or auth provider forcing your hand.",
    icon: (
      <>
        <circle cx="7" cy="12" r="3" />
        <path d="M10 12h4" />
        <circle cx="17" cy="12" r="3" />
      </>
    ),
  },
  {
    title: "Five render modes",
    body: "ssr, ssg, csr, isr, and streaming, chosen per route — this page itself is ssg, pre-rendered once at build time.",
    icon: (
      <>
        <rect x="3.5" y="4" width="17" height="16" rx="2" />
        <path d="M3.5 9.5h17" />
      </>
    ),
  },
  {
    title: "Islands, not full hydration",
    body: "Opt a single component into client hydration while the rest of the page stays static HTML — the real fix for React's hydration cost.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
  },
];

export default function Home({ data }) {
  const version = data?.version;
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <style>{`
        body { overflow-x: hidden; }
        .devora-page { max-width: 1180px; }
        .home-prose { max-width: 46rem; margin-left: auto; margin-right: auto; }
        .home-video-hero {
          position: relative;
          display: block;
          overflow: hidden;
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          margin-top: -3rem;
          margin-bottom: 0;
          aspect-ratio: 21 / 9;
          max-height: 280px;
          background: #000;
        }
        .home-video-hero video {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .home-video-hero:hover video { transform: scale(1.015); }
        .home-video-hero-fade {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 65%;
          background: linear-gradient(to bottom, transparent, var(--devora-bg));
          pointer-events: none;
        }
        .home-video-hero-chip {
          position: absolute;
          right: 1rem;
          top: 1rem;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(8, 8, 14, 0.5);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 600;
        }
        @media (max-width: 640px) {
          .home-video-hero { aspect-ratio: 16 / 10; max-height: 260px; }
        }
        .home-hero {
          position: relative;
          z-index: 2;
          overflow: hidden;
          max-width: 44rem;
          margin: -5.5rem auto 3rem;
          padding: 3rem 2rem;
          border-radius: 20px;
          background: var(--devora-bg-elevated);
          border: 1px solid var(--devora-border);
          text-align: center;
        }
        .home-blob {
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.35;
          pointer-events: none;
          z-index: 0;
        }
        .home-blob-a { background: var(--devora-accent-from); top: -140px; left: -90px; }
        .home-blob-b { background: var(--devora-accent-to); bottom: -160px; right: -100px; }
        .home-hero > * { position: relative; z-index: 1; }
        .home-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--devora-fg-muted);
          border: 1px solid var(--devora-border);
          border-radius: 999px;
          padding: 0.35rem 0.85rem;
          margin: 0 0 1.25rem;
        }
        .home-eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(90deg, var(--devora-accent-from), var(--devora-accent-to));
        }
        .home-title {
          font-size: clamp(2.25rem, 5vw, 3.25rem);
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0 0 1rem;
        }
        .home-title-gradient {
          background: linear-gradient(90deg, var(--devora-accent-from), var(--devora-accent-to), var(--devora-accent-from));
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .home-subtitle {
          max-width: 46rem;
          margin: 0 auto 2rem;
          font-size: 1.05rem;
          line-height: 1.7;
          color: var(--devora-fg-muted);
        }
        .home-subtitle strong { color: var(--devora-fg); }
        .home-cta-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }
        .home-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.7rem 1.4rem;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none;
          transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease;
        }
        .home-btn-primary {
          position: relative;
          overflow: hidden;
          background: linear-gradient(90deg, var(--devora-accent-from), var(--devora-accent-to));
          color: white;
          box-shadow: var(--devora-shadow);
        }
        .home-btn-primary::after {
          content: var(--pseudo-content);
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.35) 50%, transparent 60%);
          transform: translateX(-120%);
          transition: transform 0.6s ease;
        }
        .home-btn-primary:hover::after { transform: translateX(120%); }
        .home-btn-secondary {
          background: transparent;
          color: var(--devora-fg);
          border: 1px solid var(--devora-border);
        }
        .home-btn:hover { transform: translateY(-1px); opacity: 0.94; }
        .home-btn:active { transform: translateY(0); }

        .video-lightbox {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 100;
          align-items: center;
          justify-content: center;
          padding: 3.5rem 1.5rem 1.5rem;
          background: rgba(5, 5, 10, 0.82);
          backdrop-filter: blur(4px);
        }
        .video-lightbox:target { display: flex; }
        .video-lightbox-inner {
          position: relative;
          width: 100%;
          max-width: 900px;
        }
        .video-lightbox video {
          width: 100%;
          display: block;
          border-radius: var(--devora-radius);
          border: 1px solid var(--devora-border);
          background: #000;
          box-shadow: var(--devora-shadow);
        }
        .video-lightbox-close {
          position: absolute;
          top: -2.75rem;
          right: 0;
          width: 2.25rem;
          height: 2.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--devora-bg-elevated);
          border: 1px solid var(--devora-border);
          color: var(--devora-fg);
          text-decoration: none;
          font-size: 1.15rem;
          line-height: 1;
        }
        .video-lightbox-close:hover { border-color: var(--devora-accent-from); }
        .home-terminal {
          max-width: 30rem;
          margin: 0 auto;
          text-align: left;
          background: var(--devora-bg);
          border: 1px solid var(--devora-border);
          border-radius: 10px;
          overflow: hidden;
        }
        .home-terminal-bar {
          display: flex;
          gap: 0.35rem;
          padding: 0.6rem 0.75rem;
          border-bottom: 1px solid var(--devora-border);
        }
        .home-terminal-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--devora-border); }
        .home-terminal code {
          display: block;
          padding: 0.85rem 1rem;
          background: transparent;
          border: none;
          font-size: 0.9rem;
          color: var(--devora-fg);
        }
        .home-terminal code::before { content: "$ "; color: var(--devora-fg-muted); }
        .home-terminal-typed {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          vertical-align: bottom;
          width: 24ch;
        }
        @media (prefers-reduced-motion: no-preference) {
          .home-terminal-typed {
            width: 0;
            border-right: 2px solid var(--devora-accent-from);
            animation: home-typing 1.6s steps(24, end) 1.15s forwards, home-caret 0.7s step-end infinite 1.15s;
          }
          @keyframes home-typing { to { width: 24ch; } }
          @keyframes home-caret { 50% { border-color: transparent; } }
        }

        .home-section-title {
          font-size: 1.85rem;
          margin: 0 0 0.5rem;
          padding-left: 0;
          text-align: center;
          letter-spacing: -0.01em;
        }
        .devora-page .home-section-title { padding-left: 0; }
        .devora-page .home-section-title::before { content: none; }
        .home-section-title::after {
          content: var(--pseudo-content);
          display: block;
          width: 48px;
          height: 3px;
          margin: 0.85rem auto 0;
          border-radius: 2px;
          background: linear-gradient(90deg, var(--devora-accent-from), var(--devora-accent-to));
        }
        .home-section-subtitle {
          text-align: center;
          color: var(--devora-fg-muted);
          font-size: 1.05rem;
          margin: 0 0 2.25rem;
        }

        .home-compare {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin: 1.75rem auto 2.5rem;
          max-width: 62rem;
        }
        .home-compare-card {
          min-width: 0;
          padding: 1.5rem 1.75rem;
          border-radius: var(--devora-radius);
          border: 1px solid var(--devora-border);
        }
        .home-compare-card ul { margin: 0; padding-left: 1.2rem; color: var(--devora-fg-muted); }
        .home-compare-card li { margin-bottom: 0.6rem; line-height: 1.6; }
        .home-compare-card li:last-child { margin-bottom: 0; }
        .home-compare-implicit { background: var(--devora-bg-elevated); }
        .home-compare-explicit {
          background: var(--devora-card);
          border-color: var(--devora-accent-from);
          box-shadow: var(--devora-shadow);
        }
        .home-compare-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--devora-fg-muted);
          margin-bottom: 0.75rem;
        }
        .home-compare-explicit .home-compare-label {
          background: linear-gradient(90deg, var(--devora-accent-from), var(--devora-accent-to));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        @media (max-width: 640px) {
          .home-compare { grid-template-columns: 1fr; }
          .home-compare-card { padding: 1.25rem; }
          .home-compare-card code { overflow-wrap: anywhere; }
        }
        ${COMPARE_TABLE_CSS}
        .home-compare-more {
          max-width: 62rem;
          margin: 0 auto 3rem;
          border: 1px solid var(--devora-border);
          border-radius: calc(var(--devora-radius) + 6px);
          overflow: hidden;
        }
        .home-compare-more-note {
          margin: 0;
          padding: 1.1rem 1.5rem;
          font-size: 0.9rem;
          line-height: 1.65;
          color: var(--devora-fg-muted);
          background: var(--devora-bg-elevated);
          border-bottom: 1px solid var(--devora-border);
        }
        .home-compare-more-note strong { color: var(--devora-fg); }
        .home-compare-more-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem 2rem;
          padding: 1.4rem 1.5rem;
          background: color-mix(in srgb, var(--devora-accent-from) 8%, transparent);
        }
        .home-compare-more-title { margin: 0 0 0.25rem; font-size: 1.1rem; font-weight: 700; color: var(--devora-fg); }
        .home-compare-more-sub { margin: 0; color: var(--devora-fg-muted); line-height: 1.55; }
        .home-compare-more-cta .home-btn { flex-shrink: 0; }
        @media (max-width: 640px) {
          .home-compare-more-cta { flex-direction: column; align-items: flex-start; }
        }


        .home-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          margin: 1.75rem 0 3rem;
        }
        .home-feature-card {
          padding: 1.5rem;
          border-radius: var(--devora-radius);
          border: 1px solid var(--devora-border);
          background: var(--devora-card);
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .home-feature-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--devora-shadow);
          border-color: var(--devora-accent-from);
        }
        .home-feature-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          margin-bottom: 0.85rem;
          background: linear-gradient(135deg, color-mix(in srgb, var(--devora-accent-from) 18%, transparent), color-mix(in srgb, var(--devora-accent-to) 18%, transparent));
          color: var(--devora-accent-from);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .home-feature-card:hover .home-feature-icon { transform: scale(1.12) rotate(-6deg); }
        .home-feature-card h3 { margin: 0 0 0.4rem; font-size: 1rem; }
        .home-feature-card p { margin: 0; font-size: 0.9rem; line-height: 1.55; }

        .home-next {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-top: 1.75rem;
        }
        .home-next-link {
          display: block;
          min-width: 0;
          padding: 1rem 1.1rem;
          border-radius: var(--devora-radius);
          border: 1px solid var(--devora-border);
          text-decoration: none;
          color: var(--devora-fg);
          font-weight: 600;
          font-size: 0.9rem;
          overflow-wrap: break-word;
          transition: transform 0.15s ease, border-color 0.15s ease;
        }
        .home-next-link span {
          display: block;
          margin-top: 0.3rem;
          color: var(--devora-fg-muted);
          font-weight: 400;
          font-size: 0.8rem;
          overflow-wrap: break-word;
        }
        .home-next-link:hover { transform: translateX(2px); border-color: var(--devora-accent-from); }

        @media (prefers-reduced-motion: no-preference) {
          @keyframes home-fade-up {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes home-float {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(18px, -16px); }
          }
          .home-hero .home-eyebrow,
          .home-hero .home-title,
          .home-hero .home-subtitle,
          .home-hero .home-cta-row,
          .home-hero .home-terminal {
            animation: home-fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
          .home-hero .home-eyebrow { animation-delay: 0.02s; }
          .home-hero .home-title { animation-delay: 0.08s; }
          .home-hero .home-subtitle { animation-delay: 0.16s; }
          .home-hero .home-cta-row { animation-delay: 0.24s; }
          .home-hero .home-terminal { animation-delay: 0.3s; }
          .home-blob-a { animation: home-float 9s ease-in-out infinite; }
          .home-blob-b { animation: home-float 11s ease-in-out infinite reverse; }
          @keyframes home-gradient-pan {
            0%, 100% { background-position: 0% center; }
            50% { background-position: 100% center; }
          }
          .home-title-gradient { animation: home-gradient-pan 6s ease-in-out infinite; }
        }

        /*
         * Scroll-reveal, pure CSS — deliberately not JS. This page hydrates
         * in dev mode (see the "<!-- -->" hydration comment markers in the
         * dev HTML), and React's reconciliation overwrites className back to
         * what it rendered, stripping any class a script adds — an
         * IntersectionObserver + classList.add approach is fundamentally
         * unreliable here, not just a timing issue. Default state is fully
         * visible; @supports only turns on the animation where the browser
         * can drive it off the scroll timeline itself, so there is no
         * unsupported/failure state where content can end up stuck hidden.
         */
        .reveal { opacity: 1; }
        @supports (animation-timeline: view()) {
          @media (prefers-reduced-motion: no-preference) {
            .reveal {
              opacity: 0;
              animation: home-reveal-in linear both;
              animation-timeline: view();
              animation-range: entry 0% cover 25%;
            }
            @keyframes home-reveal-in {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          }
        }

        @media (max-width: 640px) {
          .home-hero { padding: 2.25rem 1.25rem; }
        }
      `}</style>

      <a href="#watch-demo" className="home-video-hero" aria-label="Watch the devora.js demo with sound">
        <video autoPlay muted loop playsInline preload="auto">
          <source src="/video/devorajs.mp4" type="video/mp4" />
        </video>
        <div className="home-video-hero-fade" aria-hidden="true" />
        <span className="home-video-hero-chip">▶ muted</span>
      </a>

      <section className="home-hero">
        <div className="home-blob home-blob-a" aria-hidden="true" />
        <div className="home-blob home-blob-b" aria-hidden="true" />

        <div className="home-eyebrow">
          <span className="home-eyebrow-dot" aria-hidden="true" />
          {version ? `v${version} · ` : ""}Vite-based · security-first
        </div>

        <h1 className="home-title">
          <span className="home-title-gradient">Devora.js</span>
        </h1>

        <p className="home-subtitle">
          A lightweight, Vite-based, security-first web framework whose headline feature is{" "}
          <strong>native multi-app support</strong> — one project, multiple sites or panels
          (marketing site, main app, admin panel), sharing a core, deployable independently.
        </p>

        <div className="home-cta-row">
          <a className="home-btn home-btn-primary" href="/getting-started" style={{ "--pseudo-content": '""' }}>
            Get started →
          </a>
          <a className="home-btn home-btn-secondary" href="/core-concepts">
            Core concepts
          </a>
        </div>

        <div className="home-terminal">
          <div className="home-terminal-bar">
            <span className="home-terminal-dot" aria-hidden="true" />
            <span className="home-terminal-dot" aria-hidden="true" />
            <span className="home-terminal-dot" aria-hidden="true" />
          </div>
          <code><span className="home-terminal-typed">npx create-devora@latest</span></code>
        </div>
      </section>

      <div id="watch-demo" className="video-lightbox">
        <div className="video-lightbox-inner">
          <a href="#" className="video-lightbox-close" aria-label="Close video">
            ×
          </a>
          <video controls preload="none">
            <source src="/video/devorajs.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
      <script src="/js/video-lightbox.js" />

      <h2 className="home-section-title reveal" style={{ "--pseudo-content": '""' }}>Why it exists</h2>
      <p className="home-section-subtitle">
        Two problems, solved at the framework level instead of papered over with tooling.
      </p>

      <p className="home-prose">
        Most teams building a marketing site, a product app, and an admin panel end up either
        bolting three separate repos together with a monorepo tool, or cramming all three into one
        Next.js app and fighting its App Router for the seams between them. Devora.js treats
        multi-app as a first-class concept: apps live side by side in one project, share one core
        and one backend by default, and each can still be deployed independently.
      </p>
      <p className="home-prose">
        The other half of the pitch is a direct reaction to the App Router's original caching
        model: <strong>explicit over implicit</strong>. Caching, data flow, and server/client
        boundaries are visible in your route files, not inferred from file-naming conventions or
        hidden behind multiple layers of framework-managed revalidation.
      </p>
      <p className="home-prose" style={{ fontSize: "0.85rem" }}>
        To be fair to Next.js: version 16 moved the same way. With Cache Components (the{" "}
        <code>cacheComponents</code> option), caching is opt-in via <code>"use cache"</code> and
        everything else runs at request time. The left card below describes the App Router's
        defaults through Next.js 15, which is still what many existing apps run.
      </p>

      <div className="home-compare reveal">
        <div className="home-compare-card home-compare-implicit">
          <span className="home-compare-label">The implicit way (App Router, Next.js ≤15)</span>
          <ul>
            <li>Caching layered and inferred across fetch, route segment, and framework defaults</li>
            <li>Server/client boundary guessed from directives and file position</li>
            <li>Revalidation timing lives inside framework internals</li>
          </ul>
        </div>
        <div className="home-compare-card home-compare-explicit">
          <span className="home-compare-label">The Devora.js way</span>
          <ul>
            <li>
              <code>renderMode</code> declared per route: <code>ssr</code>/<code>ssg</code>/
              <code>csr</code>/<code>isr</code>/<code>streaming</code>
            </li>
            <li>
              <code>loader</code>/<code>action</code> exported explicitly for data and mutations
            </li>
            <li>
              <code>revalidate: {"{"} seconds {"}"}</code> written in the route file itself
            </li>
          </ul>
        </div>
      </div>

      <p className="home-prose">
        Security follows the same philosophy: it's a default, not a plugin. CSP and HSTS headers
        are on for every app out of the box, and there's no dynamic <code>eval</code>/
        <code>require</code> path anywhere reachable from user input.
      </p>

      <h2 className="home-section-title reveal" style={{ "--pseudo-content": '""' }}>How it compares</h2>
      <p className="home-section-subtitle">
        Fair trade-offs, not a scoreboard — these are different tools solving overlapping problems.
      </p>

      <CompareTable
        className="reveal"
        columns={[
          { label: "Next.js", logo: LOGO_NEXTJS },
          { label: "Turborepo / Nx", logo: [LOGO_TURBOREPO, LOGO_NX] },
          { label: "Plain React", logo: LOGO_REACT },
          { label: "Devora.js", logo: LOGO_DEVORA, highlight: true },
        ]}
        rows={[
          {
            label: "What it is",
            cells: ["Framework", "Build/task tool", "UI library", "Framework"],
          },
          {
            label: "Multiple apps, one project",
            cells: [
              <><a href="https://nextjs.org/docs/app/guides/multi-zones">Multi-Zones</a> — separate deployments, one domain</>,
              "Wire it yourself, any framework",
              "Separate project per app",
              "Native — one config, shared core; separate deployments",
            ],
          },
          {
            label: "Navigating between apps",
            cells: ["Full page load", "—", "Full page load", "Full page load — same as Multi-Zones"],
          },
          {
            label: "Shared backend",
            cells: [
              "Per-app API routes / Route Handlers",
              "Not its job",
              "You build it",
              <>One shared <code>packages/backend</code></>,
            ],
          },
          {
            label: "Client JS shipped",
            cells: [
              <>Zero by default; <code>"use client"</code> pulls in a whole subtree</>,
              "—",
              "Everything, until you add your own SSR",
              <>Zero by default; <code>island()</code> opts in one component</>,
            ],
          },
          {
            label: "Security headers (CSP/HSTS)",
            cells: ["Manual — middleware/config", "—", "Manual", "On by default, every app"],
          },
          {
            label: "Adding a second app",
            cells: [
              <>New zone + <code>rewrites</code>/<code>assetPrefix</code></>,
              "New app + wire the tooling yourself",
              "New Vite config + router",
              <><code>devora add &lt;name&gt;</code></>,
            ],
          },
        ]}
      />
      <div className="home-compare-more reveal">
        <p className="home-compare-more-note">
          <strong>About Turborepo and Nx:</strong> they're monorepo task runners, not frameworks —
          a "—" means the dimension isn't their job, not a knock against them. A large or polyglot
          repo still wants one of them; devora.js doesn't replace what they do, it just doesn't
          require one for "a few apps sharing one core."
        </p>
        <div className="home-compare-more-cta">
          <div>
            <p className="home-compare-more-title">Want the whole picture?</p>
            <p className="home-compare-more-sub">
              SvelteKit, Astro, React Router, Express, Fastify, and NestJS too — with adoption
              numbers, and where each one is ahead.
            </p>
          </div>
          <a className="home-btn home-btn-primary" href="/compare" style={{ "--pseudo-content": '""' }}>
            See the full comparison →
          </a>
        </div>
      </div>

      <h2 className="home-section-title reveal" style={{ "--pseudo-content": '""' }}>What you get</h2>
      <p className="home-section-subtitle">Six things the framework handles so your app code doesn't have to.</p>

      <div className="home-features">
        {FEATURES.map((f) => (
          <div className="home-feature-card reveal" key={f.title}>
            <div className="home-feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {f.icon}
              </svg>
            </div>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </div>

      <h2 className="home-section-title reveal" style={{ "--pseudo-content": '""' }}>Where to go next</h2>
      <div className="home-next">
        <a className="home-next-link reveal" href="/getting-started">
          Getting started
          <span>Scaffold a project</span>
        </a>
        <a className="home-next-link reveal" href="/core-concepts">
          Core concepts
          <span>Multi-app &amp; auth</span>
        </a>
        <a className="home-next-link reveal" href="/render-modes">
          Render modes
          <span>ssr/ssg/csr/isr/streaming</span>
        </a>
        <a className="home-next-link reveal" href="/backend">
          Backend
          <span>Modules, API routes, middleware</span>
        </a>
        <a className="home-next-link reveal" href="/repo-splitting">
          Repo-splitting
          <span>Split an app into its own repo</span>
        </a>
        <a className="home-next-link reveal" href="/cli-reference">
          CLI reference
          <span>Every command</span>
        </a>
        <a className="home-next-link reveal" href="/deployment">
          Deployment
          <span>Vercel, Netlify, VPS</span>
        </a>
        <a className="home-next-link reveal" href="/security">
          Security model
          <span>CSP, sessions, CSRF</span>
        </a>
        <a
          className="home-next-link reveal"
          href="https://discord.gg/wYFYmFxdS8"
          target="_blank"
          rel="noopener noreferrer"
        >
          Community
          <span>Join on Discord — questions, feedback, contributors</span>
        </a>
      </div>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Devora.js docs",
            url: `${SITE_URL}/`,
            inLanguage: "en",
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareSourceCode",
            name: "Devora.js",
            description:
              "A lightweight, Vite-based, security-first web framework with native multi-app support — one project, multiple sites, sharing a core, deployable independently.",
            url: `${SITE_URL}/`,
            image: OG_IMAGE,
            codeRepository: "https://github.com/hassanalsa3aka/devora.js",
            programmingLanguage: "TypeScript",
            runtimePlatform: "Node.js",
            license: "https://opensource.org/licenses/MIT",
            ...(version ? { version } : {}),
          },
        ]}
      />
    </PageShell>
  );
}
