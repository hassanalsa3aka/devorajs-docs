#!/usr/bin/env bash
# Renders the link-preview cards in assets/og/ from scripts/og-card.html.
# A page uses its card through pageMeta(path, { ..., image: "/og/<name>.png" }).
# Usage: scripts/og-cards.sh   (CHROME=/path/to/chrome to override)
set -e
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

card() { # name title accent subtitle
  local q
  q="title=$(node -p 'encodeURIComponent(process.argv[1])' "$2")&accent=$(node -p 'encodeURIComponent(process.argv[1])' "$3")&sub=$(node -p 'encodeURIComponent(process.argv[1])' "$4")"
  "$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 \
    --screenshot="assets/og/$1.png" "file://$PWD/scripts/og-card.html?$q" 2>/dev/null
  echo "assets/og/$1.png"
}

"$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 \
  --screenshot=assets/og/devorajs-og.png "file://$PWD/scripts/og-card.html" 2>/dev/null
card examples "Examples" "and live demos." "Runnable Devora.js projects, and the example apps deployed on Vercel."
card live-updates "Live updates," "polled or pushed." "Poll, or run a small realtime server. The token flow, the CSP setting and a runnable example."
card blog "Blog" "" "Release notes and design write-ups from the Devora.js project."
card performance "Performance," "measured." "Devora.js next to Next.js, Astro, SvelteKit and React Router on the same pages."
