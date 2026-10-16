// Starts the muted hero video only where it is worth its 24 MB: not on a
// phone-sized screen, not with Save-Data or a 2G connection, not when the
// visitor asked for reduced motion. Everywhere else the poster image stays.
(function () {
  var v = document.querySelector(".home-video-hero video");
  if (!v) return;
  var c = navigator.connection;
  var saveData = c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ""));
  var small = window.matchMedia("(max-width: 640px)").matches;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (saveData || small || reduce) return;
  var source = v.querySelector("source[data-src]");
  if (!source) return;
  source.src = source.getAttribute("data-src");
  v.load();
  var p = v.play();
  if (p && p.catch) p.catch(function () {});
})();
