import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";

export const renderMode = "ssg";

export function meta() {
  return {
    title: "Devora.js — security-first, multi-app by default",
    description:
      "A lightweight, Vite-based web framework whose headline feature is native multi-app support — one project, multiple sites, sharing a core, deployable independently.",
  };
}

export async function loader() {
  return {};
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
    body: "CSP, HSTS, and signed sessions are on for every app out of the box — you opt out, not in.",
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
    title: "Four render modes",
    body: "ssr, ssg, csr, and isr, chosen per route — this page itself is ssg, pre-rendered once at build time.",
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

export default function Home() {
  return (
    <PageShell nav={DOCS_NAV}>
      <style>{`
        .home-hero {
          position: relative;
          overflow: hidden;
          margin: -0.5rem 0 3rem;
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
          background: linear-gradient(90deg, var(--devora-accent-from), var(--devora-accent-to));
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
          background: linear-gradient(90deg, var(--devora-accent-from), var(--devora-accent-to));
          color: white;
          box-shadow: var(--devora-shadow);
        }
        .home-btn-secondary {
          background: transparent;
          color: var(--devora-fg);
          border: 1px solid var(--devora-border);
        }
        .home-btn:hover { transform: translateY(-1px); opacity: 0.94; }
        .home-btn:active { transform: translateY(0); }
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

        .home-section-title {
          font-size: 1.4rem;
          margin: 0 0 0.4rem;
          text-align: center;
        }
        .home-section-subtitle {
          text-align: center;
          color: var(--devora-fg-muted);
          margin: 0 0 2rem;
        }

        .home-compare {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin: 1.5rem 0 3rem;
        }
        .home-compare-card {
          padding: 1.25rem;
          border-radius: var(--devora-radius);
          border: 1px solid var(--devora-border);
        }
        .home-compare-card ul { margin: 0; padding-left: 1.1rem; color: var(--devora-fg-muted); }
        .home-compare-card li { margin-bottom: 0.4rem; line-height: 1.5; }
        .home-compare-implicit { background: var(--devora-bg-elevated); }
        .home-compare-explicit {
          background: var(--devora-card);
          border-color: var(--devora-accent-from);
          box-shadow: var(--devora-shadow);
        }
        .home-compare-label {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--devora-fg-muted);
          margin-bottom: 0.6rem;
        }
        .home-compare-explicit .home-compare-label {
          background: linear-gradient(90deg, var(--devora-accent-from), var(--devora-accent-to));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .home-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0 3rem;
        }
        .home-feature-card {
          padding: 1.25rem;
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
        }
        .home-feature-card h3 { margin: 0 0 0.4rem; font-size: 1rem; }
        .home-feature-card p { margin: 0; font-size: 0.9rem; line-height: 1.55; }

        .home-next {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
          margin-top: 1.5rem;
        }
        .home-next-link {
          display: block;
          padding: 1rem 1.1rem;
          border-radius: var(--devora-radius);
          border: 1px solid var(--devora-border);
          text-decoration: none;
          color: var(--devora-fg);
          font-weight: 600;
          font-size: 0.9rem;
          transition: transform 0.15s ease, border-color 0.15s ease;
        }
        .home-next-link span {
          display: block;
          margin-top: 0.3rem;
          color: var(--devora-fg-muted);
          font-weight: 400;
          font-size: 0.8rem;
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
          .home-feature-card {
            animation: home-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
          .home-features .home-feature-card:nth-child(1) { animation-delay: 0.05s; }
          .home-features .home-feature-card:nth-child(2) { animation-delay: 0.1s; }
          .home-features .home-feature-card:nth-child(3) { animation-delay: 0.15s; }
          .home-features .home-feature-card:nth-child(4) { animation-delay: 0.2s; }
          .home-features .home-feature-card:nth-child(5) { animation-delay: 0.25s; }
          .home-features .home-feature-card:nth-child(6) { animation-delay: 0.3s; }
        }

        @media (max-width: 640px) {
          .home-compare { grid-template-columns: 1fr; }
          .home-hero { padding: 2.25rem 1.25rem; }
        }
      `}</style>

      <section className="home-hero">
        <div className="home-blob home-blob-a" aria-hidden="true" />
        <div className="home-blob home-blob-b" aria-hidden="true" />

        <div className="home-eyebrow">
          <span className="home-eyebrow-dot" aria-hidden="true" />
          v1 · Vite-based · security-first
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
          <a className="home-btn home-btn-primary" href="/getting-started">
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
          <code>npx create-devora@latest</code>
        </div>
      </section>

      <h2 className="home-section-title">Why it exists</h2>
      <p className="home-section-subtitle">
        Two problems, solved at the framework level instead of papered over with tooling.
      </p>

      <p>
        Most teams building a marketing site, a product app, and an admin panel end up either
        bolting three separate repos together with a monorepo tool, or cramming all three into one
        Next.js app and fighting its App Router for the seams between them. Devora.js treats
        multi-app as a first-class concept: apps live side by side in one project, share one core
        and one backend by default, and each can still be deployed independently.
      </p>
      <p>
        The other half of the pitch is a direct reaction to Next.js: <strong>explicit over
        implicit</strong>. Caching, data flow, and server/client boundaries are visible in your
        route files, not inferred from file-naming conventions or hidden behind multiple layers of
        framework-managed revalidation.
      </p>

      <div className="home-compare">
        <div className="home-compare-card home-compare-implicit">
          <span className="home-compare-label">The implicit way</span>
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
              <code>csr</code>/<code>isr</code>
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

      <p>
        Security follows the same philosophy: it's a default, not a plugin. CSP and HSTS headers
        are on for every app out of the box, and there's no dynamic <code>eval</code>/
        <code>require</code> path anywhere reachable from user input.
      </p>

      <h2 className="home-section-title">What you get</h2>
      <p className="home-section-subtitle">Six things the framework handles so your app code doesn't have to.</p>

      <div className="home-features">
        {FEATURES.map((f) => (
          <div className="home-feature-card" key={f.title}>
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

      <h2 className="home-section-title">Where to go next</h2>
      <div className="home-next">
        <a className="home-next-link" href="/getting-started">
          Getting started
          <span>Scaffold a project</span>
        </a>
        <a className="home-next-link" href="/core-concepts">
          Core concepts
          <span>Multi-app &amp; auth</span>
        </a>
        <a className="home-next-link" href="/render-modes">
          Render modes
          <span>ssr/ssg/csr/isr</span>
        </a>
        <a className="home-next-link" href="/backend">
          Backend (v2)
          <span>Modules, API routes, middleware</span>
        </a>
        <a className="home-next-link" href="/cli-reference">
          CLI reference
          <span>Every command</span>
        </a>
        <a className="home-next-link" href="/deployment">
          Deployment
          <span>Vercel, Netlify, VPS</span>
        </a>
        <a className="home-next-link" href="/security">
          Security model
          <span>CSP, sessions, CSRF</span>
        </a>
      </div>
    </PageShell>
  );
}
