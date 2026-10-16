/* Phone and tablet menus. Loaded in <head> (classic, tiny) so the class below is set before the header paints.
   Without this script nothing collapses: the header keeps its wrapped link row and the docs sidebar its full list.
   - The header's "Menu" link (href="#menu") opens and closes the link panel under the logo.
   - The docs "Docs menu" button opens and closes the docs sidebar.
   Escape, a click outside, a click on a link and a resize to a wide screen close them. */
(function () {
  var root = document.documentElement;
  root.classList.add("js-menu");
  var WIDE = window.matchMedia("(min-width: 901px)");

  function header() { return document.querySelector(".devora-header"); }
  function burger() { return document.querySelector('.devora-nav a[href="#menu"]'); }
  function layout() { return document.querySelector(".docs-layout"); }
  function docsButton() { return document.querySelector(".docs-menu-btn"); }

  function setHeader(open) {
    var h = header();
    if (!h) return;
    if (open) h.setAttribute("data-menu-open", ""); else h.removeAttribute("data-menu-open");
    var b = burger();
    if (b) b.setAttribute("aria-expanded", open ? "true" : "false");
  }
  function setDocs(open) {
    var l = layout(), b = docsButton();
    if (!l || !b) return;
    if (open) l.setAttribute("data-docs-open", ""); else l.removeAttribute("data-docs-open");
    b.setAttribute("aria-expanded", open ? "true" : "false");
  }
  function closeAll() { setHeader(false); setDocs(false); }

  document.addEventListener("DOMContentLoaded", function () {
    var b = burger(), nav = document.querySelector(".devora-nav");
    if (b) {
      b.setAttribute("role", "button");
      b.setAttribute("aria-expanded", "false");
      if (nav) { if (!nav.id) nav.id = "site-nav"; b.setAttribute("aria-controls", nav.id); }
    }
  });

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var b = t.closest('.devora-nav a[href="#menu"]');
    if (b) {
      e.preventDefault();
      var h = header();
      setDocs(false);
      setHeader(!(h && h.hasAttribute("data-menu-open")));
      return;
    }
    var d = t.closest(".docs-menu-btn");
    if (d) {
      var l = layout();
      setHeader(false);
      setDocs(!(l && l.hasAttribute("data-docs-open")));
      return;
    }
    if (t.closest(".devora-nav a") || t.closest(".docs-sidebar a")) { closeAll(); return; }
    if (!t.closest(".devora-header") && !t.closest(".docs-menu-btn") && !t.closest(".docs-sidebar")) closeAll();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var h = header(), wasOpen = h && h.hasAttribute("data-menu-open");
    closeAll();
    if (wasOpen && burger()) burger().focus();
  });

  var onWide = function (m) { if (m.matches) closeAll(); };
  if (WIDE.addEventListener) WIDE.addEventListener("change", onWide); else if (WIDE.addListener) WIDE.addListener(onWide);
})();
