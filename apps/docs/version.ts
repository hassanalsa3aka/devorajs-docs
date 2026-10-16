import release from "./data/release.json";

/**
 * The version this site documents: apps/docs/data/release.json, the one place it is written. The home
 * badge, the JSON-LD, the footer, the sidebar label and the "latest release" chip all read it.
 * scripts/check-versions.mjs fails the build when the installed @devorajs/core, the package.json ranges
 * or a page's text disagree with it.
 */
export const RELEASE_VERSION: string = release.version;
export const RELEASE_DATE: string = release.date;
/** The CHANGELOG entry (or, when one exists and is approved, the release post) for the latest release. */
export const RELEASE_URL = `https://github.com/hassanalsa3aka/devora.js/blob/main/CHANGELOG.md#${release.version.replace(/\./g, "")}--${release.date}`;

/** Kept for the pages that already call it; now the documented release, not whatever is installed. */
export function getCoreVersion(): string {
  return RELEASE_VERSION;
}
