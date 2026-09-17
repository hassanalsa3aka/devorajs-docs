const DOCS_GROUPS = [
  {
    label: "Getting started",
    items: [
      { id: "getting-started", label: "Getting started", href: "/getting-started" },
      { id: "core-concepts", label: "Core concepts", href: "/core-concepts" },
    ],
  },
  {
    label: "Guides",
    items: [
      { id: "render-modes", label: "Render modes", href: "/render-modes" },
      { id: "backend", label: "Backend (v2)", href: "/backend" },
      { id: "repo-splitting", label: "Repo-splitting (v2)", href: "/repo-splitting" },
    ],
  },
  {
    label: "Reference",
    items: [
      { id: "cli-reference", label: "CLI reference", href: "/cli-reference" },
      { id: "deployment", label: "Deployment", href: "/deployment" },
      { id: "security", label: "Security", href: "/security" },
    ],
  },
];

export function DocsLayout({ active, children }) {
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
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--devora-fg-muted);
          margin-bottom: 0.4rem;
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
          border-left-color: var(--devora-accent-from);
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
          .docs-sidebar-link.active { border-color: var(--devora-accent-from); }
        }
      `}</style>
      <nav className="docs-sidebar" aria-label="Docs">
        {DOCS_GROUPS.map((group) => (
          <div className="docs-sidebar-group" key={group.label}>
            <div className="docs-sidebar-label">{group.label}</div>
            {group.items.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={"docs-sidebar-link" + (item.id === active ? " active" : "")}
              >
                {item.label}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div className="docs-content">{children}</div>
    </div>
  );
}
