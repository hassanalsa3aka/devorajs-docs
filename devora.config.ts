import { defineProject } from "@devorajs/core/config";

export default defineProject({
  apps: [
    { name: "docs", dir: "apps/docs", domain: "devorajs-docs-docs.vercel.app", auth: "none" },
  ],
  shared: {
    core: "packages/core",
    backend: "packages/backend",
    auth: "shared",
  },
});
