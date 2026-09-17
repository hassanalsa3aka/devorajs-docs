const DOCS_GROUPS = [
  {
    label: "Getting started",
    color: "#3b82f6",
    items: [
      { id: "getting-started", label: "Getting started", href: "/getting-started" },
      { id: "core-concepts", label: "Core concepts", href: "/core-concepts" },
      { id: "first-feature", label: "Build your first feature", href: "/first-feature" },
    ],
  },
  {
    label: "Guides",
    color: "#a855f7",
    items: [
      { id: "render-modes", label: "Render modes", href: "/render-modes" },
      { id: "backend", label: "Backend (v2)", href: "/backend" },
      { id: "repo-splitting", label: "Repo-splitting (v2)", href: "/repo-splitting" },
    ],
  },
  {
    label: "Reference",
    color: "#10b981",
    items: [
      { id: "api-reference", label: "API reference", href: "/api-reference" },
      { id: "cli-reference", label: "CLI reference", href: "/cli-reference" },
      { id: "deployment", label: "Deployment", href: "/deployment" },
      { id: "security", label: "Security", href: "/security" },
    ],
  },
];

const CALLOUT_ICON = { warning: "!", tip: "✓", info: "i", danger: "!" };

export function Callout({ kind = "info", title, children }) {
  return (
    <div className={"callout callout-" + kind}>
      <span className="callout-icon" aria-hidden="true">{CALLOUT_ICON[kind] || "i"}</span>
      <div className="callout-body">
        {title ? <p className="callout-title">{title}</p> : null}
        <div className="callout-content">{children}</div>
      </div>
    </div>
  );
}

export function Tag({ color = "blue", children }) {
  return <span className={"tag tag-" + color}>{children}</span>;
}

export function DocsLayout({ active, children }) {
  const activeGroup = DOCS_GROUPS.find((group) => group.items.some((item) => item.id === active));
  const activeItem = activeGroup && activeGroup.items.find((item) => item.id === active);

  return (
    <div className="docs-layout">
      <style>{`
        .devora-page { max-width: 1040px; }
        .docs-layout {
          display: grid;
          grid-template-columns: 210px minmax(0, 1fr);
          gap: 2.5rem;
          align-items: start;
        }
        .docs-sidebar {
          position: sticky;
          top: 4.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
        }
        .docs-sidebar-group { display: flex; flex-direction: column; gap: 0.1rem; }
        .docs-sidebar-label {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--devora-fg-muted);
          margin-bottom: 0.4rem;
        }
        .docs-sidebar-label-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .docs-sidebar-link {
          font-size: 0.85rem;
          color: var(--devora-fg-muted);
          text-decoration: none;
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
          border-left: 2px solid transparent;
        }
        .docs-sidebar-link:hover { color: var(--devora-fg); }
        .docs-sidebar-link.active {
          color: var(--devora-fg);
          background: var(--devora-bg-elevated);
          font-weight: 600;
        }
        .docs-content { min-width: 0; }
        @media (max-width: 760px) {
          .docs-layout { grid-template-columns: 1fr; gap: 1.5rem; }
          .docs-sidebar {
            position: static;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 0.4rem;
          }
          .docs-sidebar-group { flex-direction: row; flex-wrap: wrap; gap: 0.4rem; }
          .docs-sidebar-label { display: none; }
          .docs-sidebar-link {
            border: 1px solid var(--devora-border);
            border-left: 1px solid var(--devora-border);
            border-radius: 999px;
            padding: 0.3rem 0.7rem;
          }
        }

        /* Eyebrow — colored category label above each page's h1 */
        .docs-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          margin-bottom: 0.85rem;
        }
        .docs-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; }

        /* Callouts */
        .callout {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          margin: 1.25rem 0;
          padding: 1rem 1.15rem;
          border-radius: var(--devora-radius);
          border: 1px solid;
          font-size: 0.92rem;
        }
        .callout-icon {
          flex-shrink: 0;
          width: 1.3rem;
          height: 1.3rem;
          margin-top: 0.05rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: 800;
          border-radius: 50%;
        }
        .callout-body { min-width: 0; }
        .callout-title { margin: 0 0 0.3rem; font-weight: 700; color: var(--devora-fg); }
        .callout-content { color: var(--devora-fg-muted); line-height: 1.6; }
        .callout-content > *:first-child { margin-top: 0; }
        .callout-content > *:last-child { margin-bottom: 0; }
        .callout-content p { color: inherit; line-height: inherit; }
        .callout-content code { color: var(--devora-fg); }
        .callout-warning { background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.35); }
        .callout-warning .callout-icon { background: rgba(245, 158, 11, 0.18); color: #f59e0b; }
        .callout-tip { background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.35); }
        .callout-tip .callout-icon { background: rgba(16, 185, 129, 0.18); color: #10b981; }
        .callout-info { background: rgba(59, 130, 246, 0.08); border-color: rgba(59, 130, 246, 0.35); }
        .callout-info .callout-icon { background: rgba(59, 130, 246, 0.18); color: #3b82f6; }
        .callout-danger { background: rgba(244, 63, 94, 0.08); border-color: rgba(244, 63, 94, 0.35); }
        .callout-danger .callout-icon { background: rgba(244, 63, 94, 0.18); color: #f43f5e; }

        /* Tags */
        .tag {
          display: inline-flex;
          align-items: center;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          border: 1px solid;
          line-height: 1.5;
          white-space: nowrap;
        }
        .tag-blue { color: #3b82f6; border-color: rgba(59, 130, 246, 0.4); background: rgba(59, 130, 246, 0.1); }
        .tag-purple { color: #a855f7; border-color: rgba(168, 85, 247, 0.4); background: rgba(168, 85, 247, 0.1); }
        .tag-emerald { color: #10b981; border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.1); }
        .tag-amber { color: #f59e0b; border-color: rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.1); }
        .tag-rose { color: #f43f5e; border-color: rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.1); }
        .tag-gray { color: var(--devora-fg-muted); border-color: var(--devora-border); background: var(--devora-bg-elevated); }

        /* Checklist — green check bullets, used for "fixed"/verified items */
        .check-list { list-style: none; padding-left: 0; }
        .check-list li { position: relative; padding-left: 1.7rem; }
        .check-list li::before {
          content: var(--check-content);
          position: absolute;
          left: 0;
          top: 0.05em;
          color: #10b981;
          font-weight: 800;
        }

        /* Tables */
        .docs-content table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: 0.88rem; }
        .docs-content th {
          text-align: left;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--devora-fg-muted);
          padding: 0.55rem 0.85rem;
          border-bottom: 1px solid var(--devora-border);
          white-space: nowrap;
        }
        .docs-content td {
          padding: 0.7rem 0.85rem;
          border-bottom: 1px solid var(--devora-border);
          color: var(--devora-fg-muted);
          vertical-align: top;
        }
        .docs-content th:first-child, .docs-content td:first-child { padding-left: 0; }
        .docs-content tr:last-child td { border-bottom: none; }
        .docs-content td code { color: var(--devora-fg); white-space: nowrap; }
      `}</style>
      <nav className="docs-sidebar" aria-label="Docs">
        {DOCS_GROUPS.map((group) => (
          <div className="docs-sidebar-group" key={group.label}>
            <div className="docs-sidebar-label">
              <span className="docs-sidebar-label-dot" style={{ background: group.color }} />
              {group.label}
            </div>
            {group.items.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={"docs-sidebar-link" + (item.id === active ? " active" : "")}
                style={item.id === active ? { borderLeftColor: group.color } : undefined}
              >
                {item.label}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div className="docs-content">
        {activeGroup ? (
          <div className="docs-eyebrow" style={{ color: activeGroup.color }}>
            <span className="docs-eyebrow-dot" style={{ background: activeGroup.color }} />
            {activeGroup.label}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
