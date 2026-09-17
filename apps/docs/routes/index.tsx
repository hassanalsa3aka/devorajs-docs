import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";

export const renderMode = "ssg";

export function meta() {
  return {
    title: "Devora.js — security-first, multi-app by default",
    description:
      "A lightweight, Vite-based web framework whose headline feature is native multi-app support — one project, multiple sites, sharing a core, deployable independently.",
  };
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

// Brand marks for the comparison section — Simple Icons (CC0), inlined and
// self-hosted rather than hotlinked, colored via CSS instead of their
// official brand colors so they read as neutral references, not endorsements.
const LOGO_NEXTJS = (
  <svg className="home-compare-logo" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l9.85 12.727Zm-3.332-8.533 1.6 2.061V7.2h-1.6v6.245Z" />
  </svg>
);
const LOGO_TURBOREPO = (
  <svg className="home-compare-logo logo-turbo" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11.9906 4.1957c-4.2998 0-7.7981 3.501-7.7981 7.8043s3.4983 7.8043 7.7981 7.8043c4.2999 0 7.7982-3.501 7.7982-7.8043s-3.4983-7.8043-7.7982-7.8043m0 11.843c-2.229 0-4.0356-1.8079-4.0356-4.0387s1.8065-4.0387 4.0356-4.0387S16.0262 9.7692 16.0262 12s-1.8065 4.0388-4.0356 4.0388m.6534-13.1249V0C18.9726.3386 24 5.5822 24 12s-5.0274 11.66-11.356 12v-2.9139c4.7167-.3372 8.4516-4.2814 8.4516-9.0861s-3.735-8.749-8.4516-9.0861M5.113 17.9586c-1.2502-1.4446-2.0562-3.2845-2.2-5.3046H0c.151 2.8266 1.2808 5.3917 3.051 7.3668l2.0606-2.0622zM11.3372 24v-2.9139c-2.02-.1439-3.8584-.949-5.3019-2.2018l-2.0606 2.0623c1.975 1.773 4.538 2.9022 7.361 3.0534z" />
  </svg>
);
const LOGO_NX = (
  <svg className="home-compare-logo logo-nx" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11.987 14.138l-3.132 4.923-5.193-8.427-.012 8.822H0V4.544h3.691l5.247 8.833.005-3.998 3.044 4.759zm.601-5.761c.024-.048 0-3.784.008-3.833h-3.65c.002.059-.005 3.776-.003 3.833h3.645zm5.634 4.134a2.061 2.061 0 0 0-1.969 1.336 1.963 1.963 0 0 1 2.343-.739c.396.161.917.422 1.33.283a2.1 2.1 0 0 0-1.704-.88zm3.39 1.061c-.375-.13-.8-.277-1.109-.681-.06-.08-.116-.17-.176-.265a2.143 2.143 0 0 0-.533-.642c-.294-.216-.68-.322-1.18-.322a2.482 2.482 0 0 0-2.294 1.536 2.325 2.325 0 0 1 4.002.388.75.75 0 0 0 .836.334c.493-.105.46.36 1.203.518v-.133c-.003-.446-.246-.55-.75-.733zm2.024 1.266a.723.723 0 0 0 .347-.638c-.01-2.957-2.41-5.487-5.37-5.487a5.364 5.364 0 0 0-4.487 2.418c-.01-.026-1.522-2.39-1.538-2.418H8.943l3.463 5.423-3.379 5.32h3.54l1.54-2.366 1.568 2.366h3.541l-3.21-5.052a.7.7 0 0 1-.084-.32 2.69 2.69 0 0 1 2.69-2.691h.001c1.488 0 1.736.89 2.057 1.308.634.826 1.9.464 1.9 1.541a.707.707 0 0 0 1.066.596zm.35.133c-.173.372-.56.338-.755.639-.176.271.114.412.114.412s.337.156.538-.311c.104-.231.14-.488.103-.74z" />
  </svg>
);
const LOGO_DEVORA = <img className="home-compare-logo home-compare-logo-devora" src="/icons/devorajs-logo-withoutbg.png" alt="" />;
const LOGO_REACT = (
  <svg className="home-compare-logo logo-react" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z" />
  </svg>
);

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
        .home-section-title::before { content: none; }
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
        }

        .compare-table-wrap {
          margin: 1.75rem auto 1.25rem;
          max-width: 74rem;
          overflow-x: auto;
          border: 1px solid var(--devora-border);
          border-radius: calc(var(--devora-radius) + 6px);
        }
        .compare-table {
          width: 100%;
          min-width: 800px;
          border-collapse: collapse;
          font-size: 0.92rem;
        }
        .compare-table th,
        .compare-table td {
          padding: 1rem 1.35rem;
          text-align: left;
          vertical-align: top;
          border-bottom: 1px solid var(--devora-border);
        }
        .compare-table thead th {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: var(--devora-fg-muted);
          background: var(--devora-bg-elevated);
          white-space: nowrap;
          text-align: center;
          padding-top: 1.35rem;
          padding-bottom: 1.35rem;
        }
        .compare-table thead th:first-child { background: transparent; }
        .compare-table tbody td { text-align: center; }
        .compare-table-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .compare-table-col .home-compare-logo {
          width: 34px;
          height: 34px;
          margin-right: 0;
          vertical-align: unset;
        }
        .compare-table-col .home-compare-logo-group { margin-right: 0; }
        /* Optical size correction — each brand mark fills its own 24x24
           viewBox with a different amount of ink (a solid disc vs. a thin
           line-art atom vs. a padded raster logo), so identical box sizes
           don't read as identical size. Sized per-icon to look even. */
        .compare-table-col .logo-react { width: 40px; height: 40px; }
        .compare-table-col .logo-turbo,
        .compare-table-col .logo-nx { width: 30px; height: 30px; }
        .compare-table-col .home-compare-logo-devora { width: 42px; height: 42px; }
        .compare-table tbody th {
          font-weight: 600;
          color: var(--devora-fg);
          background: var(--devora-bg-elevated);
          white-space: nowrap;
        }
        .compare-table tbody td { color: var(--devora-fg-muted); line-height: 1.55; }
        .compare-table tbody tr:last-child th,
        .compare-table tbody tr:last-child td { border-bottom: none; }
        .compare-table .home-compare-logo { width: 18px; height: 18px; vertical-align: -4px; margin-right: 0.35rem; fill: var(--devora-fg-muted); }
        .compare-table .home-compare-logo-devora { width: 20px; height: 20px; }
        .compare-table .home-compare-logo-group { display: inline-flex; align-items: center; gap: 0.2rem; margin-right: 0.35rem; }
        .compare-table .home-compare-logo-group .home-compare-logo { margin-right: 0; }
        .compare-table-highlight {
          background: color-mix(in srgb, var(--devora-accent-from) 10%, transparent) !important;
          border-left: 2px solid var(--devora-accent-from);
          font-weight: 600;
        }
        .compare-table thead .compare-table-highlight {
          color: var(--devora-accent-from);
          border-top: 2px solid var(--devora-accent-from);
        }
        .compare-table thead .compare-table-highlight .home-compare-logo { fill: var(--devora-accent-from); }
        .compare-table tbody td.compare-table-highlight { color: var(--devora-fg); }
        .compare-table tbody tr { transition: background-color 0.15s ease; }
        .compare-table tbody tr:hover td:not(.compare-table-highlight) { background: var(--devora-bg-elevated); }
        .compare-table tbody tr:hover th { background: color-mix(in srgb, var(--devora-bg-elevated) 100%, white 5%); }
        .compare-table tbody tr:hover td.compare-table-highlight { background: color-mix(in srgb, var(--devora-accent-from) 18%, transparent) !important; }

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
          .home-hero { padding: 10.25rem 1.25rem; }
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
        The other half of the pitch is a direct reaction to Next.js: <strong>explicit over
        implicit</strong>. Caching, data flow, and server/client boundaries are visible in your
        route files, not inferred from file-naming conventions or hidden behind multiple layers of
        framework-managed revalidation.
      </p>

      <div className="home-compare reveal">
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

      <p className="home-prose">
        Security follows the same philosophy: it's a default, not a plugin. CSP and HSTS headers
        are on for every app out of the box, and there's no dynamic <code>eval</code>/
        <code>require</code> path anywhere reachable from user input.
      </p>

      <h2 className="home-section-title reveal" style={{ "--pseudo-content": '""' }}>How it compares</h2>
      <p className="home-section-subtitle">
        Fair trade-offs, not a scoreboard — these are different tools solving overlapping problems.
      </p>

      <div className="compare-table-wrap reveal">
        <table className="compare-table">
          <thead>
            <tr>
              <th scope="col" />
              <th scope="col">
                <span className="compare-table-col">
                  {LOGO_NEXTJS}
                  <span>Next.js</span>
                </span>
              </th>
              <th scope="col">
                <span className="compare-table-col">
                  <span className="home-compare-logo-group">
                    {LOGO_TURBOREPO}
                    {LOGO_NX}
                  </span>
                  <span>Turborepo / Nx</span>
                </span>
              </th>
              <th scope="col">
                <span className="compare-table-col">
                  {LOGO_REACT}
                  <span>Plain React</span>
                </span>
              </th>
              <th scope="col" className="compare-table-highlight">
                <span className="compare-table-col">
                  {LOGO_DEVORA}
                  <span>Devora.js</span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">What it is</th>
              <td>Framework</td>
              <td>Build/task tool</td>
              <td>UI library</td>
              <td className="compare-table-highlight">Framework</td>
            </tr>
            <tr>
              <th scope="row">Multiple apps, one project</th>
              <td>
                <a href="https://nextjs.org/docs/app/guides/multi-zones">Multi-Zones</a> — separate
                deployments, hard navigation between them
              </td>
              <td>Wire it yourself, any framework</td>
              <td>Separate project per app</td>
              <td className="compare-table-highlight">Native — one config, shared core</td>
            </tr>
            <tr>
              <th scope="row">Shared backend</th>
              <td>Per-app API routes / Route Handlers</td>
              <td>Not its job</td>
              <td>You build it</td>
              <td className="compare-table-highlight">One shared <code>packages/backend</code></td>
            </tr>
            <tr>
              <th scope="row">Client JS shipped</th>
              <td>Zero by default; <code>"use client"</code> pulls in a whole subtree</td>
              <td>—</td>
              <td>Everything, until you add your own SSR</td>
              <td className="compare-table-highlight">Zero by default; <code>island()</code> opts in one component</td>
            </tr>
            <tr>
              <th scope="row">Security headers (CSP/HSTS)</th>
              <td>Manual — middleware/config</td>
              <td>—</td>
              <td>Manual</td>
              <td className="compare-table-highlight">On by default, every app</td>
            </tr>
            <tr>
              <th scope="row">Adding a second app</th>
              <td>New zone + <code>rewrites</code>/<code>assetPrefix</code></td>
              <td>New app + wire the tooling yourself</td>
              <td>New Vite config + router</td>
              <td className="compare-table-highlight"><code>devora add &lt;name&gt;</code></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="home-prose" style={{ fontSize: "0.85rem" }}>
        Turborepo and Nx are monorepo task runners, not frameworks — a "—" means the dimension isn't
        their job, not a knock against them. A large or polyglot repo still wants one of them; devora.js
        doesn't replace what they do, it just doesn't require one for "a few apps sharing one core."
      </p>

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
          Backend (v2)
          <span>Modules, API routes, middleware</span>
        </a>
        <a className="home-next-link reveal" href="/repo-splitting">
          Repo-splitting (v2)
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
      </div>
    </PageShell>
  );
}
