var pfReady = false;
var pfMounted = false;

// Nav "Search" pill icon and the modal's search-box icon: set as CSS custom
// properties here (not in a <style> block) because this app's SSR
// serializer HTML-escapes raw-text element content, which mangles any
// literal quote character inside inline <style>/<script> — confirmed
// directly. A JS string has no such restriction, so the icon is built once
// here and handed to CSS as a ready-made mask-image value.
var searchIconSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
document.documentElement.style.setProperty(
  "--search-icon",
  'url("data:image/svg+xml,' + encodeURIComponent(searchIconSvg) + '")'
);
document.documentElement.style.setProperty("--pseudo-content", '""');

function showSearchError() {
  var box = document.getElementById("search-overlay-pf");
  if (!box) return;
  box.innerHTML =
    '<p style="margin:0;padding:1.5rem 0;text-align:center;color:var(--devora-fg-muted);font-size:0.9rem;">' +
    "Search isn’t available in dev mode — its index is generated at build time. " +
    "Run <code>npm run build</code> (or view the deployed site) to try it." +
    "</p>";
}

function ensurePagefind(cb, onerror) {
  if (pfReady) {
    cb();
    return;
  }
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/pagefind/pagefind-ui.css";
  document.head.appendChild(link);
  var script = document.createElement("script");
  script.src = "/pagefind/pagefind-ui.js";
  script.onload = function () {
    pfReady = true;
    cb();
  };
  script.onerror = onerror;
  document.head.appendChild(script);
}

function openSiteSearch() {
  if (pfMounted) return;
  pfMounted = true;
  ensurePagefind(function () {
    new PagefindUI({ element: "#search-overlay-pf", showSubResults: true, showImages: false, autofocus: true });
  }, function () {
    pfMounted = false;
    showSearchError();
  });
}

window.addEventListener("hashchange", function () {
  if (location.hash === "#search-overlay") openSiteSearch();
});

window.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (location.hash !== "#search-overlay") return;
    location.hash = "";
    return;
  }
  var isK = e.key === "k" || e.key === "K";
  if (!isK) return;
  var hasModifier = e.metaKey || e.ctrlKey;
  if (!hasModifier) return;
  e.preventDefault();
  if (location.hash === "#search-overlay") return;
  location.hash = "#search-overlay";
});

if (location.hash === "#search-overlay") openSiteSearch();
