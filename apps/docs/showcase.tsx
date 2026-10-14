// "Built with Devora.js" entries and the maintainer's live demos, used by
// the home page and /examples. Each entry lists only what the deployed site
// shows publicly (response headers, cookies, markup, /api responses),
// checked on the date below; nothing is taken from the projects' own claims.
export const SHOWCASE_CHECKED = "October 14, 2026";

export interface ShowcaseEntry {
  name: string;
  url: string;
  image: string;
  description: string;
  uses: string[];
}

export const SHOWCASE: ShowcaseEntry[] = [
  {
    name: "YallaDo",
    url: "https://yalla-do-app.vercel.app",
    image: "/showcase/yallado.webp",
    description: "Personal and team task tracking: a private board plus shared team workspaces.",
    uses: ["SSR pages", "Islands", "Sessions + CSRF", "JSON API routes", "Security headers (custom CSP)", "Vercel"],
  },
  {
    name: "Khepra",
    url: "https://khepra.vercel.app",
    image: "/showcase/khepra.webp",
    description: "Landing page and early-access waitlist for a daily habits and workouts app.",
    uses: ["Islands", "JSON API routes", "Default security headers", "Vercel"],
  },
  {
    name: "These docs",
    url: "https://github.com/hassanalsa3aka/devorajs-docs",
    image: "/showcase/docs.webp",
    description: "This site: every page pre-rendered, with Pagefind search. The source is on GitHub.",
    uses: ["ssg pages", "Head API", "Sitemap", "Custom CSP", "Vercel"],
  },
];

export interface LiveDemo {
  platform: "Vercel" | "Netlify";
  app: string;
  url: string;
  image: string;
  shows: string;
}

// The three example apps from the devora.js repo (marketing, dashboard,
// admin), deployed by the maintainer. Only demos that answered with a
// working page when checked are listed. The Netlify deployments didn't
// respond from the checking machine, so they're left out until re-checked.
export const LIVE_DEMOS: LiveDemo[] = [
  {
    platform: "Vercel",
    app: "Marketing",
    url: "https://devora-js-marketing.vercel.app",
    image: "/showcase/demo-vercel-marketing.webp",
    shows: "auth: \"none\" — no login, no session cookie; an ISR demo page",
  },
  {
    platform: "Vercel",
    app: "Dashboard",
    url: "https://devora-js-dashboard.vercel.app",
    image: "/showcase/demo-vercel-dashboard.webp",
    shows: "Shared login, an island counter, a clientOnly() widget, a csr page",
  },
  {
    platform: "Vercel",
    app: "Admin",
    url: "https://devora-js-admin.vercel.app",
    image: "/showcase/demo-vercel-admin.webp",
    shows: "auth: \"isolated\" — its own session cookie, separate from the other two",
  },
];

export function ShowcaseCard({ entry }: { entry: ShowcaseEntry }) {
  return (
    <article className="sc-card">
      <a className="sc-shot" href={entry.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
        <img src={entry.image} alt="" width={800} height={500} loading="lazy" decoding="async" />
      </a>
      <div className="sc-body">
        <h3>
          <a href={entry.url} target="_blank" rel="noopener noreferrer">
            {entry.name}
            <span className="sc-ext" aria-hidden="true">↗</span>
          </a>
        </h3>
        <p>{entry.description}</p>
        <ul className="sc-tags" aria-label={`What ${entry.name} uses`}>
          {entry.uses.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function DemoCard({ demo }: { demo: LiveDemo }) {
  return (
    <article className="sc-card">
      <a className="sc-shot" href={demo.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
        <img src={demo.image} alt="" width={800} height={500} loading="lazy" decoding="async" />
      </a>
      <div className="sc-body">
        <h3>
          <a href={demo.url} target="_blank" rel="noopener noreferrer">
            {demo.app}
            <span className="sc-ext" aria-hidden="true">↗</span>
          </a>
        </h3>
        <p>{demo.shows}</p>
        <ul className="sc-tags" aria-label="Platform">
          <li>{demo.platform}</li>
        </ul>
      </div>
    </article>
  );
}

export const SHOWCASE_CSS = `
.sc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 1.25rem;
  margin: 1.75rem 0 1rem;
}
.sc-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid var(--devora-border);
  border-radius: var(--devora-radius-lg);
  background: var(--devora-card);
  overflow: hidden;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.sc-card:hover { border-color: var(--devora-accent-from); box-shadow: var(--devora-shadow); }
.sc-shot { display: block; border-bottom: 1px solid var(--devora-border); background: #000; }
.sc-shot img { display: block; width: 100%; height: auto; aspect-ratio: 8 / 5; }
.sc-body { padding: 1.1rem 1.25rem 1.25rem; display: flex; flex-direction: column; gap: 0.6rem; }
.devora-page .sc-body h3 { margin: 0; font-size: 1.05rem; }
.sc-body h3 a { color: var(--devora-fg); text-decoration: none; }
.sc-body h3 a:hover { text-decoration: underline; }
.sc-ext { margin-left: 0.3rem; color: var(--devora-fg-subtle); font-size: 0.85em; }
.devora-page .sc-body p { margin: 0; font-size: 0.9rem; line-height: 1.55; }
.devora-page .sc-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; list-style: none; margin: 0.15rem 0 0; padding: 0; }
.devora-page .sc-tags li {
  margin: 0;
  padding: 0.12rem 0.55rem;
  border: 1px solid var(--devora-border);
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--devora-fg-muted);
  background: var(--devora-surface);
}
.sc-note { font-size: 0.8rem; color: var(--devora-fg-muted); }
`;
