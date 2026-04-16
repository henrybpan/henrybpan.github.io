/* ============================================================
   THEME TOGGLE — sitewide
   NOTE: The anti-flash script that sets data-theme on <html>
   BEFORE first paint is inlined at the top of every page's
   <head>. This file only handles click + persistence.
============================================================
   ⚠️  CACHE-BUST CHECKLIST — READ BEFORE EDITING
   ------------------------------------------------------------
   Current cache-bust version: ?v=2

   If you change any LOGIC or BEHAVIOR below, you MUST bump
   the ?v=N query string in every themed HTML page in
   lockstep (same list as in theme.css). Otherwise Cloudflare
   + browsers will keep serving stale JS and the toggle will
   silently break.

   NEXT EDIT → bump v=2 to v=3  (then update this comment)
   Comment-only edits to this file do NOT require a bump.
============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'theme';
  var root = document.documentElement;

  function current() {
    return root.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  function set(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* storage blocked */ }
  }

  function toggle() {
    set(current() === 'dark' ? 'light' : 'dark');
  }

  function wire(btn) {
    if (!btn || btn.dataset.wired) return;
    btn.dataset.wired = '1';
    btn.setAttribute('aria-label', 'Toggle light or dark mode');
    btn.addEventListener('click', toggle);
  }

  function init() {
    document.querySelectorAll('.theme-toggle').forEach(wire);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* React to OS-level changes ONLY when the user has not set an explicit
     preference (i.e. localStorage is empty). */
  if (window.matchMedia) {
    var mql = window.matchMedia('(prefers-color-scheme: dark)');
    var listener = function (e) {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return;
      } catch (err) { /* ignore */ }
      root.dataset.theme = e.matches ? 'dark' : 'light';
    };
    if (mql.addEventListener) mql.addEventListener('change', listener);
    else if (mql.addListener) mql.addListener(listener);
  }
}());
