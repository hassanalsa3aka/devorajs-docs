import { createElement } from "react";
import { createRoot } from "react-dom/client";

// Only requested when a page's renderMode is "csr" — see
// packages/core/src/csrRoute.ts.
for (const node of document.querySelectorAll<HTMLElement>("[data-csr-entry]")) {
  const url = node.getAttribute("data-csr-entry");
  if (!url) continue;
  import(/* @vite-ignore */ url).then((mod) => {
    createRoot(node).render(createElement(mod.default));
  });
}
