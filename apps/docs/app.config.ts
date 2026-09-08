import { defineApp } from "@devorajs/core/config";

export default defineApp({
  defaultRenderMode: "ssr",
  // Opt-in, off by default — see ROADMAP.md #7. Turn on for a
  // public-facing app; leave off for an internal one.
  sitemap: false,
});
