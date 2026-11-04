import { defineProject } from "@devorajs/core/config";
import site from "./apps/docs/data/site.json";

export default defineProject({
  apps: [
    { name: "docs", dir: "apps/docs", domain: new URL(site.url).host, auth: "none" },
  ],
  shared: {
    core: "packages/core",
    backend: "packages/backend",
    auth: "shared",
  },
});
