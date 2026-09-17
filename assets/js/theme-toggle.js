(function () {
  var STORAGE_KEY = "devora-docs-theme";
  var root = document.documentElement;

  var SUN_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
  var MOON_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000"><path d="M20.8 14.5a8.5 8.5 0 01-11.3-11.3 8.5 8.5 0 1011.3 11.3z"/></svg>';

  function iconUrl(svg) {
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  // Also set (redundantly) by search-overlay.js — needed here too so this
  // icon doesn't depend on that script's load order.
  root.style.setProperty("--pseudo-content", '""');

  function isDark() {
    var explicit = root.getAttribute("data-theme");
    if (explicit) return explicit === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function updateIcon() {
    // Shows the icon for the mode a click would switch TO, not the current one.
    root.style.setProperty("--theme-icon", isDark() ? iconUrl(SUN_SVG) : iconUrl(MOON_SVG));
    var btn = document.querySelector('a[href="#theme"]');
    if (btn) {
      btn.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
      btn.setAttribute("title", isDark() ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  var stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    root.setAttribute("data-theme", stored);
  }
  updateIcon();

  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href="#theme"]');
    if (!link) return;
    e.preventDefault();
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY, next);
    updateIcon();
  });
})();
