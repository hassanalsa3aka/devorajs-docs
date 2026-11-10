// Comparison building blocks for /compare (and anything that compares
// later): status chips, a filterable feature matrix, and a horizontal bar
// chart. No script: the framework filter is checkboxes + CSS :has(), the
// matrix turns into stacked cards on narrow screens, and every chip carries
// an icon and a text label, never color alone.
import type { ReactNode } from "react";

export type Status = "built" | "partial" | "notyet" | "no" | "library" | "na" | "unverified";

const STATUS_LABEL: Record<Status, string> = {
  built: "Built in",
  partial: "Partial",
  notyet: "Not yet",
  no: "Not built in",
  library: "Use a library",
  na: "Not its job",
  unverified: "Not verified",
};

const STATUS_ICON: Record<Status, ReactNode> = {
  built: <path d="M5 12.5l4.2 4.2L19 7" />,
  partial: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 4.5v15a7.5 7.5 0 0 0 0-15z" fill="currentColor" stroke="none" />
    </>
  ),
  notyet: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8v4.5l3 1.8" />
    </>
  ),
  no: <path d="M7 7l10 10M17 7L7 17" />,
  library: (
    <>
      <path d="M9 3v4M15 3v4" />
      <path d="M6.5 7h11v3.5a5.5 5.5 0 0 1-11 0z" />
      <path d="M12 16v5" />
    </>
  ),
  na: <path d="M6 12h12" />,
  unverified: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M9.8 9.6a2.3 2.3 0 1 1 3.3 2.1c-.7.4-1.1.8-1.1 1.6" />
      <path d="M12 16.6v.1" />
    </>
  ),
};

export function StatusChip({ status }: { status: Status }) {
  return (
    <span className={`cmx-chip cmx-chip-${status}`}>
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
        {STATUS_ICON[status]}
      </svg>
      {STATUS_LABEL[status]}
    </span>
  );
}

export interface Framework {
  key: string;
  label: string;
  logo?: ReactNode;
  /** The framework this page is about: accent column, always shown. */
  highlight?: boolean;
}

export interface Cell {
  /** Omitted for a purely descriptive cell (no chip). */
  s?: Status;
  note?: ReactNode;
}

export interface MatrixRow {
  label: ReactNode;
  cells: Record<string, Cell>;
}

export interface MatrixGroup {
  topic: string;
  rows: MatrixRow[];
}

export function Matrix({
  id,
  title,
  frameworks,
  groups,
  filterable = true,
}: {
  id: string;
  title: string;
  frameworks: Framework[];
  groups: MatrixGroup[];
  /** Show the "Show" checkboxes (worth it from three optional columns). */
  filterable?: boolean;
}) {
  const optional = frameworks.filter((f) => !f.highlight);
  const filterCss = optional
    .map((f) => `#${id}:has(#${id}-show-${f.key}:not(:checked)) .cmx-col-${f.key} { display: none; }`)
    .join("\n");
  return (
    <div className="cmx" id={id}>
      {filterable ? <style dangerouslySetInnerHTML={{ __html: filterCss }} /> : null}
      {filterable ? (
      <fieldset className="cmx-filter">
        <legend>Show</legend>
        {optional.map((f) => (
          <label key={f.key} className="cmx-filter-option">
            <input type="checkbox" id={`${id}-show-${f.key}`} defaultChecked />
            {f.logo}
            {f.label}
          </label>
        ))}
      </fieldset>
      ) : null}
      <div className="cmx-scroll" role="region" aria-label={title} tabIndex={0}>
        <table className="cmx-table">
          <caption className="cmx-sr-only">{title}</caption>
          <thead>
            <tr>
              <th scope="col" className="cmx-corner">Feature</th>
              {frameworks.map((f) => (
                <th
                  scope="col"
                  key={f.key}
                  className={`cmx-col-${f.key}${f.highlight ? " cmx-highlight" : ""}`}
                >
                  <span className="cmx-head">
                    {f.logo}
                    <span>{f.label}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          {groups.map((g) => (
            <tbody key={g.topic}>
              {g.topic ? (
                <tr className="cmx-group">
                  <th scope="colgroup" colSpan={frameworks.length + 1}>
                    {g.topic}
                  </th>
                </tr>
              ) : null}
              {g.rows.map((row, r) => (
                <tr key={r}>
                  <th scope="row">{row.label}</th>
                  {frameworks.map((f) => {
                    const cell = row.cells[f.key];
                    return (
                      <td
                        key={f.key}
                        className={`cmx-col-${f.key}${f.highlight ? " cmx-highlight" : ""}`}
                        data-fw={f.label}
                      >
                        {cell?.s ? <StatusChip status={cell.s} /> : null}
                        {cell?.note ? <span className="cmx-note">{cell.note}</span> : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}

export interface Bar {
  label: ReactNode;
  value: number;
  display: string;
  highlight?: boolean;
}

/**
 * Horizontal bars, longest first, from data (never typed by hand). It is a
 * real table, so it reads correctly without CSS and to screen readers.
 */
export function BarChart({ title, unit, bars, caption }: { title: string; unit: string; bars: Bar[]; caption: ReactNode }) {
  const max = Math.max(...bars.map((b) => b.value));
  const sorted = [...bars].sort((a, b) => b.value - a.value);
  return (
    <figure className="cbar">
      <table className="cbar-table">
        <caption className="cmx-sr-only">{title}</caption>
        <thead className="cmx-sr-only">
          <tr>
            <th scope="col">Package</th>
            <th scope="col">{unit}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((b, i) => (
            <tr key={i} className={b.highlight ? "cbar-highlight" : undefined}>
              <th scope="row">{b.label}</th>
              <td>
                <span className="cbar-track" aria-hidden="true">
                  <span className="cbar-fill" style={{ width: `${Math.max((b.value / max) * 100, 0.4)}%` }} />
                </span>
                <span className="cbar-value">{b.display}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export const COMPARE_MATRIX_CSS = `
.cmx-sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}

.cmx-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.5rem 0.15rem 0.4rem;
  border-radius: 999px;
  border: 1px solid var(--devora-border);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  color: var(--devora-fg);
  background: var(--devora-surface);
}
.cmx-chip svg { fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
.cmx-chip-built { color: #15803d; border-color: color-mix(in srgb, #16a34a 45%, transparent); background: color-mix(in srgb, #16a34a 9%, var(--devora-surface)); }
.cmx-chip-partial { color: #a16207; border-color: color-mix(in srgb, #ca8a04 45%, transparent); background: color-mix(in srgb, #ca8a04 9%, var(--devora-surface)); }
.cmx-chip-notyet { color: #b91c1c; border-color: color-mix(in srgb, #dc2626 40%, transparent); background: color-mix(in srgb, #dc2626 7%, var(--devora-surface)); }
.cmx-chip-no, .cmx-chip-na, .cmx-chip-unverified { color: var(--devora-fg-muted); }
.cmx-chip-library { color: #1d4ed8; border-color: color-mix(in srgb, #2563eb 40%, transparent); background: color-mix(in srgb, #2563eb 7%, var(--devora-surface)); }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme=light]) .cmx-chip-built { color: #4ade80; }
  :root:not([data-theme=light]) .cmx-chip-partial { color: #facc15; }
  :root:not([data-theme=light]) .cmx-chip-notyet { color: #f87171; }
  :root:not([data-theme=light]) .cmx-chip-library { color: #93b8ff; }
}
:root[data-theme=dark] .cmx-chip-built { color: #4ade80; }
:root[data-theme=dark] .cmx-chip-partial { color: #facc15; }
:root[data-theme=dark] .cmx-chip-notyet { color: #f87171; }
:root[data-theme=dark] .cmx-chip-library { color: #93b8ff; }

.cmx { margin: 1.25rem 0 1rem; }
.cmx-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 0.5rem;
  margin: 0 0 0.85rem;
  padding: 0;
  border: 0;
}
.cmx-filter legend {
  float: left;
  margin-right: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--devora-fg-muted);
}
.cmx-filter-option {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 32px;
  padding: 0.25rem 0.7rem;
  border: 1px solid var(--devora-border);
  border-radius: 999px;
  font-size: 0.8rem;
  cursor: pointer;
  user-select: none;
}
.cmx-filter-option:has(input:checked) { border-color: var(--devora-border-strong); background: var(--devora-surface); }
.cmx-filter-option:has(input:focus-visible) { outline: 2px solid var(--devora-ring); outline-offset: 2px; }
.cmx-filter-option input { accent-color: var(--devora-accent-from); margin: 0; width: 15px; height: 15px; }
.cmx-filter-option .home-compare-logo { width: 14px; height: 14px; fill: var(--devora-fg); }

.cmx-scroll {
  overflow-x: auto;
  overflow-y: visible;
  border: 1px solid var(--devora-border);
  border-radius: var(--devora-radius-lg);
  background: var(--devora-card);
}
.cmx-scroll:focus-visible { outline: 2px solid var(--devora-ring); outline-offset: 2px; }
.cmx-table {
  width: 100%;
  min-width: 640px;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.85rem;
}
.cmx-table th, .cmx-table td {
  padding: 0.7rem 0.8rem;
  border-bottom: 1px solid var(--devora-border);
  text-align: left;
  vertical-align: top;
}
.cmx-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--devora-surface);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--devora-fg-muted);
  border-bottom: 1px solid var(--devora-border-strong);
  white-space: nowrap;
}
.cmx-table tbody th[scope=row] {
  position: sticky;
  left: 0;
  z-index: 1;
  background: var(--devora-card);
  min-width: 11rem;
  max-width: 14rem;
  font-weight: 600;
  color: var(--devora-fg);
}
.cmx-table thead .cmx-corner { left: 0; z-index: 3; }
.cmx-head { display: inline-flex; align-items: center; gap: 0.4rem; }
.cmx-head .home-compare-logo { width: 16px; height: 16px; fill: var(--devora-fg-muted); }
.cmx-table .cmx-highlight { background: color-mix(in srgb, var(--devora-accent-from) 7%, var(--devora-card)); }
.cmx-table thead .cmx-highlight { color: var(--devora-accent-from); background: color-mix(in srgb, var(--devora-accent-from) 10%, var(--devora-surface)); box-shadow: inset 0 2px 0 var(--devora-accent-from); }
.cmx-group th {
  position: sticky;
  left: 0;
  background: var(--devora-surface);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--devora-fg-muted);
  padding-top: 0.55rem;
  padding-bottom: 0.55rem;
}
.cmx-note { display: block; margin-top: 0.35rem; color: var(--devora-fg-muted); line-height: 1.45; }
.cmx-note code { font-size: 0.85em; }
.cmx-table tbody tr:last-child th, .cmx-table tbody tr:last-child td { border-bottom: 1px solid var(--devora-border); }

/* Narrow screens: one card per feature, one line per framework. */
@media (max-width: 720px) {
  .cmx-scroll { max-height: none; overflow: visible; border: 0; background: none; }
  .cmx-table, .cmx-table tbody, .cmx-table tr, .cmx-table th, .cmx-table td { display: block; min-width: 0; }
  .cmx-table thead { display: none; }
  .cmx-group th {
    position: static;
    background: none;
    padding: 1.25rem 0 0.5rem;
    border: 0;
  }
  .cmx-table tbody tr:not(.cmx-group) {
    margin: 0 0 0.75rem;
    border: 1px solid var(--devora-border);
    border-radius: var(--devora-radius);
    background: var(--devora-card);
    overflow: hidden;
  }
  .cmx-table tbody th[scope=row] { position: static; max-width: none; background: var(--devora-surface); }
  .cmx-table tbody td { display: grid; grid-template-columns: 7.5rem 1fr; gap: 0.25rem 0.75rem; align-items: start; }
  .cmx-table tbody td::before {
    content: attr(data-fw);
    grid-row: span 2;
    font-weight: 600;
    color: var(--devora-fg);
  }
  .cmx-table tbody td:empty { display: none; }
  .cmx-table tbody td .cmx-chip { justify-self: start; }
  .cmx-table tbody td .cmx-note { margin-top: 0; grid-column: 2; }
  .cmx-table tbody tr:not(.cmx-group) td:last-child { border-bottom: 0; }
  .cmx-table .cmx-highlight { background: color-mix(in srgb, var(--devora-accent-from) 7%, var(--devora-card)); }
}

.cbar { margin: 1.25rem 0 1.5rem; }
.cbar-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.cbar-table th, .cbar-table td { padding: 0.4rem 0; border: 0; vertical-align: middle; }
.cbar-table th { width: 11rem; padding-right: 1rem; font-weight: 500; white-space: nowrap; text-align: left; }
.cbar-table th code { font-size: 0.8rem; }
.cbar-table th .home-compare-logo { width: 14px; height: 14px; fill: var(--devora-fg-muted); vertical-align: -2px; margin-right: 0.4rem; }
.cbar-table td { display: flex; align-items: center; gap: 0.75rem; }
.cbar-track { flex: 1; height: 10px; border-radius: 999px; background: var(--devora-hover); overflow: hidden; }
.cbar-fill { display: block; height: 100%; border-radius: 999px; background: var(--devora-fg-subtle); }
.cbar-highlight .cbar-fill { background: linear-gradient(90deg, var(--devora-accent-from), var(--devora-accent-to)); }
.cbar-highlight th { color: var(--devora-accent-from); font-weight: 700; }
.cbar-value { min-width: 4.5rem; text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
.cbar figcaption { margin-top: 0.75rem; font-size: 0.8rem; line-height: 1.6; color: var(--devora-fg-muted); }
@media (max-width: 520px) {
  .cbar-table th { width: auto; display: block; padding-bottom: 0.15rem; }
  .cbar-table tr { display: block; margin-bottom: 0.5rem; }
}
`;
