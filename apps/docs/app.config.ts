import { defineApp } from "@devorajs/core/config";

export default defineApp({
  defaultRenderMode: "ssr",
  // This is a public-facing docs site, so opt in — sitemap.xml helps search
  // engines discover every page (opt-in/off by default for internal apps).
  sitemap: true,
});
