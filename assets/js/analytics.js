/*
 * Analytics for the docs site: Google Analytics 4 (with Consent Mode v2 and
 * a consent banner) plus Vercel Web Analytics, and one track() function
 * that records every meaningful interaction to both.
 *
 * Why an external file: the CSP (apps/docs/app.config.ts) allows scripts
 * from 'self' and googletagmanager.com only — no inline <script>, so GA's
 * usual inline snippet lives here instead.
 *
 * Privacy model:
 * - Vercel Web Analytics is cookieless and anonymous — it runs for everyone.
 * - GA runs in Consent Mode. Until a visitor clicks Accept, analytics_storage
 *   is "denied": GA sets no cookies and only sends anonymous, cookieless
 *   pings. Ad-related consent is always denied (this site has no ads).
 * - A Global Privacy Control signal counts as Decline, with no banner.
 * - The choice is stored in localStorage; "Cookie settings" in the footer
 *   reopens the banner.
 * - Nothing personal is sent: no form contents, no copied text, search
 *   terms are trimmed, and GA4 doesn't log or store IP addresses.
 *
 * Only loads on the production host, so local dev and preview deploys
 * don't pollute the numbers. To test elsewhere, run this in the console
 * and reload:  localStorage.setItem("devora-analytics-debug", "1")
 * — events then load and are also logged to the console (GA DebugView
 * shows them live).
 */
(function () {
  // Paste the Measurement ID from GA → Admin → Data streams → your web stream.
  var GA_ID = "G-KEHQV89XCM";
  var PRODUCTION_HOST = "devorajs-docs-docs.vercel.app";
  var CONSENT_KEY = "devora-analytics-consent"; // "granted" | "denied"
  var DEBUG_KEY = "devora-analytics-debug";

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }

  var debug = storageGet(DEBUG_KEY) === "1";
  var enabled = location.hostname === PRODUCTION_HOST || debug;
  var gaConfigured = /^G-[A-Z0-9]+$/.test(GA_ID) && GA_ID !== "G-XXXXXXXXXX";
  var gpc = navigator.globalPrivacyControl === true;

  function loadScript(src) {
    var s = document.createElement("script");
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  // ---- Google Analytics 4 + Consent Mode v2 --------------------------------
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  var stored = storageGet(CONSENT_KEY);
  if (!stored && gpc) {
    stored = "denied";
    storageSet(CONSENT_KEY, stored);
  }

  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: stored === "granted" ? "granted" : "denied",
  });

  if (enabled && gaConfigured) {
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + GA_ID);
    gtag("js", new Date());
    gtag("config", GA_ID, debug ? { debug_mode: true } : {});
    // Which colour scheme people actually read the docs in.
    gtag("set", "user_properties", {
      color_scheme: currentTheme(),
    });
  }

  // ---- Vercel Web Analytics ------------------------------------------------
  // Same queue-stub pattern as @vercel/analytics' inject(): calls made
  // before the script loads are replayed once it does. The script is served
  // by Vercel itself once Web Analytics is enabled for the project.
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  if (enabled) loadScript("/_vercel/insights/script.js");

  // ---- track() -------------------------------------------------------------
  // opts.gaOnly: high-volume events (scroll depth, section views, errors) go
  // to GA only — Vercel custom events count against the plan's event quota.
  function track(name, params, opts) {
    params = params || {};
    if (debug || !enabled) {
      // Visible in dev too, so new tracking can be checked without deploying.
      console.debug("[analytics]", name, params);
    }
    if (!enabled) return;
    gtag("event", name, params);
    if (!(opts && opts.gaOnly)) {
      try { window.va("event", { name: name, data: params }); } catch (e) { /* ignore */ }
    }
  }
  window.devoraTrack = track;

  // ---- helpers -------------------------------------------------------------
  function clip(text, max) {
    text = (text || "").replace(/\s+/g, " ").trim();
    return text.length > max ? text.slice(0, max) : text;
  }

  function currentTheme() {
    var explicit = document.documentElement.getAttribute("data-theme");
    if (explicit) return explicit;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function linkLocation(el) {
    if (el.closest("#search-overlay")) return "search_results";
    if (el.closest(".devora-header")) return "header";
    if (el.closest(".docs-sidebar")) return "sidebar";
    if (el.closest(".devora-footer, footer")) return "footer";
    if (el.closest(".compare-jump")) return "compare_jump";
    if (el.closest(".home-next")) return "next_steps";
    if (el.closest(".home-btn, .consent-banner")) return "button";
    if (el.closest("table")) return "table";
    return "content";
  }

  // ---- consent banner ------------------------------------------------------
  var banner = null;

  function setConsent(choice) {
    storageSet(CONSENT_KEY, choice);
    gtag("consent", "update", { analytics_storage: choice });
    track("consent_update", { choice: choice });
    hideBanner();
  }

  function hideBanner() {
    if (banner) {
      banner.remove();
      banner = null;
    }
  }

  function showBanner() {
    if (banner) return;
    banner = document.createElement("div");
    banner.className = "consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", "Cookie consent");
    banner.innerHTML =
      '<p class="consent-banner-text">We use cookies from Google Analytics to understand how the docs are used ' +
      "— which pages help, and what people search for. No ads, nothing sold. " +
      '<a href="/privacy">Privacy details</a></p>' +
      '<div class="consent-banner-actions">' +
      '<button type="button" class="consent-btn" data-consent="denied">Decline</button>' +
      '<button type="button" class="consent-btn consent-btn-primary" data-consent="granted">Accept</button>' +
      "</div>";
    banner.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-consent]");
      if (btn) setConsent(btn.getAttribute("data-consent"));
    });
    document.body.appendChild(banner);
  }

  // Only ask when GA is actually going to run here.
  function maybeShowBanner() {
    if (enabled && gaConfigured && !storageGet(CONSENT_KEY)) showBanner();
  }

  // ---- interaction tracking ------------------------------------------------
  var lastSearch = "";

  document.addEventListener(
    "click",
    function (e) {
      var a = e.target.closest && e.target.closest("a");
      if (!a) return;
      var href = a.getAttribute("href") || "";

      if (href === "#cookie-settings") {
        e.preventDefault();
        showBanner();
        track("cookie_settings_open", {});
        return;
      }
      if (href === "#theme") {
        // theme-toggle.js flips data-theme in its own click handler; read
        // the result after it has run.
        setTimeout(function () {
          var theme = currentTheme();
          track("theme_toggle", { theme: theme });
          if (enabled && gaConfigured) gtag("set", "user_properties", { color_scheme: theme });
        }, 0);
        return;
      }
      if (href === "#search-overlay") {
        track("search_open", { source: "nav" });
        return;
      }

      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      var type =
        url.origin !== location.origin ? "outbound"
        : url.pathname === location.pathname && url.hash ? "anchor"
        : "internal";
      var where = linkLocation(a);

      if (where === "search_results") {
        track("search_result_click", {
          search_term: lastSearch,
          link_url: url.pathname + url.hash,
          link_text: clip(a.textContent, 100),
        });
        return;
      }

      track("link_click", {
        link_text: clip(a.textContent || a.getAttribute("aria-label"), 100),
        link_url: type === "outbound" ? url.href : url.pathname + url.hash,
        link_type: type,
        link_location: where,
      });
    },
    true
  );

  // Cmd/Ctrl+K opens search (search-overlay.js handles the opening itself).
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      track("search_open", { source: "shortcut" });
    }
  });

  // Search queries typed into Pagefind's box, debounced so one search is
  // one event, not one per keystroke. Result count read from Pagefind's own
  // "N results for …" message once it has updated.
  var searchTimer = null;
  document.addEventListener("input", function (e) {
    var input = e.target;
    if (!input.classList || !input.classList.contains("pagefind-ui__search-input")) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      var term = clip(input.value, 100);
      if (term.length < 2 || term === lastSearch) return;
      lastSearch = term;
      var message = document.querySelector("#search-overlay-pf .pagefind-ui__message");
      var count = message ? parseInt(message.textContent, 10) : NaN;
      track("search", {
        search_term: term,
        results_count: isNaN(count) ? 0 : count,
      });
    }, 1200);
  });

  // Copying from a code block — records where, never what.
  document.addEventListener("copy", function () {
    var sel = window.getSelection && window.getSelection();
    if (!sel || sel.isCollapsed || !sel.anchorNode) return;
    var node = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
    if (!node || !node.closest("pre, code")) return;
    var heading = null;
    var h = node.closest("pre, code");
    // Nearest section heading above the code block, for "which example".
    var all = document.querySelectorAll(".devora-page h2, .devora-page h3");
    for (var i = 0; i < all.length; i++) {
      if (all[i].compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING) heading = all[i];
    }
    track("code_copy", {
      section: heading ? clip(heading.textContent, 80) : "",
      characters: String(sel).length,
    });
  });

  // Video: the demo in the lightbox. The muted, looping hero background
  // video is skipped — it would log a "complete" on every loop.
  var videoState = typeof WeakMap === "function" ? new WeakMap() : null;
  function videoInfo(v) {
    if (!videoState) return { started: false, milestones: {} };
    var s = videoState.get(v);
    if (!s) { s = { started: false, milestones: {} }; videoState.set(v, s); }
    return s;
  }
  function isTrackedVideo(v) {
    return v && v.tagName === "VIDEO" && !v.loop;
  }
  document.addEventListener("play", function (e) {
    var v = e.target;
    if (!isTrackedVideo(v)) return;
    var s = videoInfo(v);
    if (!s.started) {
      s.started = true;
      track("video_start", { video: clip(v.currentSrc.split("/").pop(), 80) });
    }
  }, true);
  document.addEventListener("timeupdate", function (e) {
    var v = e.target;
    if (!isTrackedVideo(v) || !v.duration) return;
    var s = videoInfo(v);
    var pct = (v.currentTime / v.duration) * 100;
    [25, 50, 75].forEach(function (m) {
      if (pct >= m && !s.milestones[m]) {
        s.milestones[m] = true;
        track("video_progress", { video: clip(v.currentSrc.split("/").pop(), 80), percent: m }, { gaOnly: true });
      }
    });
  }, true);
  document.addEventListener("ended", function (e) {
    var v = e.target;
    if (!isTrackedVideo(v)) return;
    track("video_complete", { video: clip(v.currentSrc.split("/").pop(), 80) });
  }, true);

  // Scroll depth at 25/50/75/90/100%, once each per page view.
  var depthsSent = {};
  var scrollTicking = false;
  function checkScroll() {
    scrollTicking = false;
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    var pct = Math.round((window.scrollY / scrollable) * 100);
    [25, 50, 75, 90, 100].forEach(function (d) {
      if (pct >= d && !depthsSent[d]) {
        depthsSent[d] = true;
        track("scroll_depth", { percent: d }, { gaOnly: true });
      }
    });
  }
  window.addEventListener("scroll", function () {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(checkScroll);
    }
  }, { passive: true });

  // Which sections people actually reach — each h2 with an id, once, when
  // at least half of it has been on screen.
  function watchSections() {
    if (!("IntersectionObserver" in window)) return;
    var seen = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.id;
        if (entry.isIntersecting && !seen[id]) {
          seen[id] = true;
          track("section_view", { section_id: id, section_title: clip(entry.target.textContent, 80) }, { gaOnly: true });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll(".devora-page h2[id]").forEach(function (h) { observer.observe(h); });
  }

  // JavaScript errors on the page (message only, clipped).
  window.addEventListener("error", function (e) {
    track("js_error", {
      message: clip(e.message, 150),
      source: clip((e.filename || "").split("/").pop(), 80),
    }, { gaOnly: true });
  });

  function onReady() {
    maybeShowBanner();
    watchSections();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
