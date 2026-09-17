#!/usr/bin/env bash
# Builds the docs app and its Pagefind search index in one place, so
# package.json's local `postbuild`, netlify.toml, and vercel.json don't each
# repeat (and risk drifting out of sync on) the same multi-step command —
# it also keeps each deploy config's build command short. Vercel in
# particular enforces a 256-character limit on `buildCommand`; the inline
# version of this (devora build + pagefind + copy) ran to 291.
#
# Usage: scripts/build-docs.sh [adapter]
#   scripts/build-docs.sh            # local: assumes `devora build` already
#                                     # ran (via the `build` npm script that
#                                     # triggers this as `postbuild`), only
#                                     # (re)indexes search.
#   scripts/build-docs.sh vercel     # deploy: also runs the adapter build.
#   scripts/build-docs.sh netlify
set -e
cd "$(dirname "$0")/.."

ADAPTER="$1"
if [ -n "$ADAPTER" ]; then
  ./node_modules/.bin/devora build --app=docs --adapter="$ADAPTER"
fi

# Pagefind's index is written into assets/ (the docs app's publicDir), not
# straight into dist/, so it's servable from `devora dev` too — not just a
# real build. See its .gitignore entry: this directory is generated, not
# source. Then copied into dist/client for this build's actual output,
# since Pagefind ran after Vite's own publicDir copy already happened.
#
# Self-heals if the binary is missing: confirmed on a real Vercel deploy
# that its cached-build install step can restore node_modules without this
# binary even though it's a normal devDependency (devora itself, a
# `dependencies` entry, was present and ran fine). `npx --yes pagefind`
# alone does NOT help here — confirmed directly: npx refuses to fetch a
# package that's already declared in package.json, so it just fails the
# same way if the local install is missing. Installing it explicitly first
# (only when actually missing) is what actually fixes it.
if [ ! -x ./node_modules/.bin/pagefind ]; then
  npm install --no-save pagefind
fi
./node_modules/.bin/pagefind --site apps/docs/dist/static --root-selector ".devora-page" --output-path assets/pagefind
rm -rf apps/docs/dist/client/pagefind
cp -r assets/pagefind apps/docs/dist/client/pagefind
