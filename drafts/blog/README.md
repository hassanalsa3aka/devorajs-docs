# Blog drafts

Each post is two files here: `<slug>.tsx` (a route, same shape as `apps/docs/routes/blog/*.tsx`) and
`<slug>.json` (title, description, tags). A draft has no date.

Preview, in a checkout (git worktree) of this repo with `node_modules` linked:

    node scripts/preview-drafts.mjs /path/to/worktree
    # then build and start that worktree as usual (npm run build; devora start --app=docs)

Publishing a draft (only after the maintainer approves that post):

1. `git mv drafts/blog/<slug>.tsx apps/docs/routes/blog/<slug>.tsx`
2. Add its metadata from `drafts/blog/<slug>.json` to `apps/docs/data/blog-posts.json` with `"date"` set to the
   day it is published (today, never earlier), then `git rm` is not needed: `git mv` the `.json` to nowhere,
   i.e. delete the draft metadata file in the same commit.
3. `bash scripts/og-cards.sh --blog-only` for the post's OG card, then build; the RSS feed, sitemap, search index
   and JSON-LD come from the post and the metadata.
4. Run the site checks (build, link crawl, Lighthouse, no horizontal scroll).

Rules for every post: each claim and code sample comes from the CHANGELOG, the docs, the examples or a test that
was run; samples were run before they went in; what was not verified is said; no "fastest"; no marketing language;
the author is the maintainer; no mention of any tool or assistant.
