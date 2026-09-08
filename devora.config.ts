import { defineProject } from "@devorajs/core/config";

export default defineProject({
  apps: [
    { name: "docs", dir: "apps/docs", domain: "docs.example.com", auth: "none" },
  ],
  shared: {
    core: "packages/core",
    backend: "packages/backend",
    auth: "shared",
  },
});
