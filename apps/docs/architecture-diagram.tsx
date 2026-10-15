// The "one project" diagram: three apps, one shared backend, one login, your
// database. Inline SVG (strict CSP: no external images, no script), colours
// from the site's tokens so it follows light/dark. Two layouts of the same
// picture: a wide one and a stacked one for phones (the CSS below switches
// between them; the hidden one is display:none, so a screen reader reads one).
// Only what exists today is drawn: apps from the scaffold's devora.config.ts,
// the shared packages/backend, the shared session, and a database that is
// the user's own choice (the framework ships none).

export const ARCH_CSS = `
  .arch { margin: 1.75rem auto 3rem; max-width: 62rem; }
  .arch svg { display: block; width: 100%; height: auto; }
  .arch .arch-narrow { display: none; }
  @media (max-width: 640px) {
    .arch .arch-wide { display: none; }
    .arch .arch-narrow { display: block; }
  }
  .arch-box { fill: var(--devora-card); stroke: var(--devora-border); stroke-width: 1.5; }
  .arch-app { stroke: var(--devora-accent-from); }
  .arch-backend { fill: color-mix(in srgb, var(--devora-accent-from) 10%, var(--devora-card)); stroke: var(--devora-accent-from); stroke-width: 2; }
  .arch-db { fill: transparent; stroke: var(--devora-fg-muted); stroke-dasharray: 6 5; }
  .arch-line { stroke: var(--devora-fg-muted); stroke-width: 1.5; fill: none; }
  .arch-session { stroke: var(--devora-accent-to); stroke-width: 1.5; fill: none; }
  .arch-dot { fill: var(--devora-accent-to); }
  .arch-t { fill: var(--devora-fg); font: 600 15px/1.2 var(--devora-font-sans, system-ui, sans-serif); }
  .arch-s { fill: var(--devora-fg-muted); font: 400 12.5px/1.2 var(--devora-font-sans, system-ui, sans-serif); }
  .arch-c { fill: var(--devora-accent-to); font: 600 12.5px/1.2 var(--devora-font-sans, system-ui, sans-serif); }
  .arch figcaption { margin-top: 0.85rem; text-align: center; color: var(--devora-fg-muted); font-size: 0.9rem; line-height: 1.6; }
`;

const APPS = [
  { name: "marketing", dir: "apps/marketing" },
  { name: "dashboard", dir: "apps/dashboard" },
  { name: "admin", dir: "apps/admin" },
];

export function ArchitectureDiagram() {
  return (
    <figure className="arch">
      <svg className="arch-wide" viewBox="0 0 760 330" role="img" aria-labelledby="arch-w-title arch-w-desc">
        <title id="arch-w-title">One project, several apps</title>
        <desc id="arch-w-desc">
          Three apps (marketing, dashboard, admin) on the left each call one shared backend in
          packages/backend in the middle. One shared login session connects the apps. The backend
          talks to your own database on the right, which is your choice. Each app deploys separately.
        </desc>
        <defs>
          <marker id="arch-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 10 5 0 10z" className="arch-dot" />
          </marker>
        </defs>
        {APPS.map((a, i) => (
          <g key={a.name}>
            <rect className="arch-box arch-app" x="34" y={24 + i * 100} width="200" height="72" rx="10" />
            <text className="arch-t" x="54" y={54 + i * 100}>{a.name}</text>
            <text className="arch-s" x="54" y={76 + i * 100}>{a.dir} · deploys on its own</text>
            <path className="arch-line" d={`M234 ${60 + i * 100} H300 L330 165`} markerEnd="url(#arch-arrow)" />
          </g>
        ))}
        <path className="arch-session" d="M16 60 V260" />
        {[60, 160, 260].map((y) => <circle key={y} className="arch-dot" cx="16" cy={y} r="4" />)}
        <text className="arch-c" x="2" y="318">one login</text>
        <rect className="arch-box arch-backend" x="330" y="105" width="190" height="120" rx="12" />
        <text className="arch-t" x="350" y="146">packages/backend</text>
        <text className="arch-s" x="350" y="170">one set of functions,</text>
        <text className="arch-s" x="350" y="190">called by every app</text>
        <path className="arch-line" d="M520 165 H590" strokeDasharray="6 5" markerEnd="url(#arch-arrow)" />
        <rect className="arch-box arch-db" x="590" y="115" width="156" height="100" rx="12" />
        <text className="arch-t" x="610" y="155">your database</text>
        <text className="arch-s" x="610" y="179">your choice —</text>
        <text className="arch-s" x="610" y="197">none is built in</text>
      </svg>

      <svg className="arch-narrow" viewBox="0 0 320 430" role="img" aria-labelledby="arch-n-title arch-n-desc">
        <title id="arch-n-title">One project, several apps</title>
        <desc id="arch-n-desc">
          Three apps (marketing, dashboard, admin) side by side, joined by one shared login, all
          calling one shared backend in packages/backend, which talks to your own database. Each
          app deploys separately.
        </desc>
        {APPS.map((a, i) => (
          <g key={a.name}>
            <rect className="arch-box arch-app" x={6 + i * 104} y="14" width="100" height="62" rx="10" />
            <text className="arch-t" x={16 + i * 104} y="42" style={{ fontSize: "13px" }}>{a.name}</text>
            <text className="arch-s" x={16 + i * 104} y="62" style={{ fontSize: "10.5px" }}>own deploy</text>
            <path className="arch-line" d={`M${56 + i * 104} 76 V170`} markerEnd="url(#arch-arrow-n)" />
          </g>
        ))}
        <defs>
          <marker id="arch-arrow-n" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 10 5 0 10z" className="arch-dot" />
          </marker>
        </defs>
        <path className="arch-session" d="M56 100 H264" />
        {[56, 160, 264].map((x) => <circle key={x} className="arch-dot" cx={x} cy="100" r="4" />)}
        <text className="arch-c" x="104" y="124">one login across the apps</text>
        <rect className="arch-box arch-backend" x="6" y="172" width="308" height="86" rx="12" />
        <text className="arch-t" x="22" y="206">packages/backend</text>
        <text className="arch-s" x="22" y="230">one set of functions, called by every app</text>
        <path className="arch-line" d="M160 258 V316" strokeDasharray="6 5" markerEnd="url(#arch-arrow-n)" />
        <rect className="arch-box arch-db" x="6" y="318" width="308" height="86" rx="12" />
        <text className="arch-t" x="22" y="352">your database</text>
        <text className="arch-s" x="22" y="376">your choice — none is built in</text>
      </svg>
      <figcaption>Each app builds and deploys separately. The backend and the login are shared.</figcaption>
    </figure>
  );
}
