import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";

// Only requested when a page actually used an island() — see
// packages/core/src/islandComponent.tsx.
for (const node of document.querySelectorAll<HTMLElement>("[data-island]")) {
  const url = node.getAttribute("data-island-url");
  if (!url) continue;
  const propsJson = node.getAttribute("data-island-props");
  const props = propsJson ? JSON.parse(propsJson) : {};
  import(/* @vite-ignore */ url).then((mod) => {
    hydrateRoot(node, createElement(mod.default, props));
  });
}
