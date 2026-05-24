/**
 * ============================================================================
 *  ZERO-FLASH SPA ROUTER
 *  A production-ready, progressive-enhancement vanilla JS router.
 *
 *  - Intercepts internal <a> clicks and resolves them via fetch().
 *  - Swaps only #main-content innerHTML + document.title.
 *  - Wraps transitions in the View Transitions API when supported.
 *  - Manages history.pushState / popstate for native back/forward.
 *  - Exposes lifecycle hooks for script re-initialization.
 *  - Gracefully degrades: if JS is disabled, links work normally.
 * ============================================================================
 */

;(function SpaRouter() {
  'use strict';

  // ── Configuration ──────────────────────────────────────────────────────────
  const CONTENT_SELECTOR  = '#main-content';
  const TRANSITION_CLASS  = 'spa-navigating';      // applied to <html> during swap
  const FETCH_TIMEOUT_MS  = 8000;                  // abort fetch after 8 s
  const SCROLL_CACHE_KEY  = '__spa_scroll_cache__';

  // ── Internal State ─────────────────────────────────────────────────────────
  let _navId          = 0;   // monotonic counter; guards race conditions
  let _isNavigating   = false;
  let _scrollPositions = {};  // url → { x, y } for scroll restoration

  // Restore any persisted scroll map (survives soft reloads)
  try {
    const stored = sessionStorage.getItem(SCROLL_CACHE_KEY);
    if (stored) _scrollPositions = JSON.parse(stored);
  } catch { /* non-critical */ }

  // ── Lifecycle Hooks (consumer registers via SPARouter.on*) ─────────────
  const _hooks = {
    beforeNavigate : [],   // (fromUrl, toUrl)       → may return false to cancel
    afterRender    : [],   // (toUrl, contentEl)      → re-bind listeners here
    onError        : [],   // (error, url)            → custom error handling
  };

  /**
   * Public API exposed on window.SPARouter
   */
  const API = Object.freeze({
    /** Navigate programmatically. Returns a promise that resolves after render. */
    navigate,

    /** Register a hook.  type: 'beforeNavigate' | 'afterRender' | 'onError' */
    on(type, fn) {
      if (_hooks[type]) _hooks[type].push(fn);
      return API; // chainable
    },

    /** Remove a previously registered hook. */
    off(type, fn) {
      if (_hooks[type]) _hooks[type] = _hooks[type].filter(h => h !== fn);
      return API;
    },

    /** Prefetch a URL into the browser cache (call on hover / touchstart). */
    prefetch(url) {
      const resolved = _resolveUrl(url);
      if (!resolved || !_isInternal(resolved)) return;
      // Use <link rel="prefetch"> so the browser handles dedup and caching.
      if (!document.querySelector(`link[rel="prefetch"][href="${resolved.pathname}"]`)) {
        const link = document.createElement('link');
        link.rel  = 'prefetch';
        link.href = resolved.pathname + resolved.search;
        document.head.appendChild(link);
      }
    },
  });

  // ── URL Helpers ────────────────────────────────────────────────────────────

  /**
   * Safely parse a string into a URL object, returning null on failure.
   */
  function _resolveUrl(raw) {
    try { return new URL(raw, location.origin); }
    catch { return null; }
  }

  /**
   * Determine whether a URL is an internal, same-origin page navigation
   * (not a hash-only jump, not a download, not mailto, etc.).
   */
  function _isInternal(url) {
    if (url.origin !== location.origin)                       return false;
    if (url.pathname === location.pathname
        && url.search === location.search
        && url.hash)                                          return false; // hash-only
    return true;
  }

  /**
   * Determine whether a click event should be intercepted.
   */
  function _shouldIntercept(anchor, event) {
    if (event.defaultPrevented)                               return false;
    if (event.button !== 0)                                   return false; // non-left click
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (anchor.target && anchor.target !== '_self')           return false;
    if (anchor.hasAttribute('download'))                      return false;
    if (anchor.getAttribute('rel')?.includes('external'))    return false;
    if (anchor.dataset.spaIgnore !== undefined)               return false;

    const url = _resolveUrl(anchor.href);
    return url && _isInternal(url);
  }

  // ── Core Navigation ────────────────────────────────────────────────────────

  /**
   * Navigate to `url`. Push to history unless `opts.replace` or `opts.pop`.
   *
   * @param {string}  url
   * @param {Object}  [opts]
   * @param {boolean} [opts.replace]  – use replaceState instead of pushState
   * @param {boolean} [opts.pop]      – triggered by popstate, skip pushState
   * @returns {Promise<void>}
   */
  async function navigate(url, opts = {}) {
    const resolved = _resolveUrl(url);
    if (!resolved || !_isInternal(resolved)) {
      // External or unparseable → let the browser handle it
      location.href = url;
      return;
    }

    const from = location.href;
    const to   = resolved.pathname + resolved.search;

    // ── Run beforeNavigate hooks (any can cancel) ──
    for (const fn of _hooks.beforeNavigate) {
      if (fn(from, to) === false) return;
    }

    // ── Race-condition guard ──
    const thisNavId = ++_navId;
    _isNavigating   = true;
    document.documentElement.classList.add(TRANSITION_CLASS);

    try {
      // ── Fetch the target page ──
      const html = await _fetchPage(to);

      // If a newer navigation was started while we were fetching, abort.
      if (thisNavId !== _navId) return;

      // ── Parse response ──
      const { title, content } = _parsePage(html);

      // ── Save current scroll position before swapping ──
      _scrollPositions[from] = { x: scrollX, y: scrollY };
      _persistScrollCache();

      // ── Swap DOM (with View Transition if available) ──
      const applyUpdate = () => {
        const container = document.querySelector(CONTENT_SELECTOR);
        if (!container) {
          console.warn('[SPA Router] Target container not found:', CONTENT_SELECTOR);
          location.href = to; // hard fallback
          return;
        }

        container.innerHTML = content;
        document.title      = title;

        // ── Update history ──
        if (opts.pop) {
          /* popstate already updated the URL */
        } else if (opts.replace) {
          history.replaceState({ spa: true }, '', to);
        } else {
          history.pushState({ spa: true }, '', to);
        }

        // ── Scroll restoration ──
        if (opts.pop && _scrollPositions[to]) {
          const { x, y } = _scrollPositions[to];
          requestAnimationFrame(() => window.scrollTo(x, y));
        } else if (resolved.hash) {
          const target = document.querySelector(resolved.hash);
          if (target) {
            requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth' }));
          }
        } else {
          window.scrollTo(0, 0);
        }

        // ── Execute inline <script> tags inside new content ──
        _rerunScripts(container);

        // ── Fire afterRender hooks ──
        for (const fn of _hooks.afterRender) {
          try { fn(to, container); }
          catch (e) { console.error('[SPA Router] afterRender hook error:', e); }
        }
      };

      // Use View Transitions API when the browser supports it
      if (document.startViewTransition) {
        await document.startViewTransition(applyUpdate).finished;
      } else {
        applyUpdate();
      }

    } catch (err) {
      // Only act on errors for the *current* navigation
      if (thisNavId !== _navId) return;

      console.error('[SPA Router] Navigation failed:', err);

      for (const fn of _hooks.onError) {
        try { fn(err, to); } catch { /* swallow hook errors */ }
      }

      // If every error hook was silent, fall back to a hard navigation
      // so the user is never stuck on a broken page.
      if (_hooks.onError.length === 0) {
        location.href = to;
      }

    } finally {
      if (thisNavId === _navId) {
        _isNavigating = false;
        document.documentElement.classList.remove(TRANSITION_CLASS);
      }
    }
  }

  // ── Fetch with timeout + AbortController ───────────────────────────────────

  /**
   * Fetch a page's HTML as text, with a configurable timeout.
   * @param {string} url
   * @returns {Promise<string>}
   */
  async function _fetchPage(url) {
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        signal      : controller.signal,
        credentials : 'same-origin',
        headers     : { 'X-SPA-Request': '1' },   // lets the server distinguish SPA fetches
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} – ${res.statusText}`);
      }

      // Guard against non-HTML responses (e.g. an API endpoint)
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        throw new Error(`Unexpected content-type: ${contentType}`);
      }

      return await res.text();
    } finally {
      clearTimeout(timer);
    }
  }

  // ── HTML Parsing ───────────────────────────────────────────────────────────

  /**
   * Extract the <title> and #main-content innerHTML from a full HTML string.
   */
  function _parsePage(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const titleEl   = doc.querySelector('title');
    const contentEl = doc.querySelector(CONTENT_SELECTOR);

    return {
      title   : titleEl   ? titleEl.textContent : document.title,
      content : contentEl ? contentEl.innerHTML  : html,
    };
  }

  // ── Script Re-execution ────────────────────────────────────────────────────

  /**
   * Inline <script> tags injected via innerHTML are inert by spec.
   * Clone them into live <script> elements so they execute.
   */
  function _rerunScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(old => {
      const fresh = document.createElement('script');

      // Copy all attributes (src, type, async, etc.)
      for (const attr of old.attributes) {
        fresh.setAttribute(attr.name, attr.value);
      }

      // Copy inline text content
      if (!old.src) {
        fresh.textContent = old.textContent;
      }

      old.replaceWith(fresh);
    });
  }

  // ── Scroll Cache Persistence ───────────────────────────────────────────────

  function _persistScrollCache() {
    try {
      sessionStorage.setItem(SCROLL_CACHE_KEY, JSON.stringify(_scrollPositions));
    } catch { /* storage full – non-critical */ }
  }

  // ── Event Listeners ────────────────────────────────────────────────────────

  /**
   * Delegate click handler: intercepts all qualifying <a> clicks site-wide.
   * Uses event delegation on document.body so dynamically injected links
   * are captured automatically — no re-binding needed.
   */
  function _onLinkClick(event) {
    // Walk up from event target to find the nearest <a>
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    if (!_shouldIntercept(anchor, event)) return;

    event.preventDefault();
    navigate(anchor.href);
  }

  /**
   * Handle browser back/forward (including swipe gestures on mobile).
   */
  function _onPopState(event) {
    // Only handle SPA-pushed states, or the initial page load state
    navigate(location.href, { pop: true });
  }

  // ── Optional: Prefetch on hover / touchstart for perceived speed ───────

  function _onPointerEnter(event) {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    API.prefetch(anchor.href);
  }

  // ── Boot ───────────────────────────────────────────────────────────────────

  function _init() {
    // Mark the initial page load in history so popstate works correctly
    history.replaceState({ spa: true }, '', location.href);

    // Delegate all click events on the document
    document.addEventListener('click', _onLinkClick);

    // Listen for browser back/forward
    window.addEventListener('popstate', _onPopState);

    // Prefetch on hover (desktop) and touchstart (mobile)
    document.addEventListener('pointerenter', _onPointerEnter, { capture: true, passive: true });

    // Expose API globally
    window.SPARouter = API;
  }

  // Boot when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

})();


/* ═══════════════════════════════════════════════════════════════════════════
 *  COMPANION CSS (paste into your stylesheet)
 *  Provides the View Transition animations and the navigating indicator.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ::view-transition-old(root) {
 *    animation: spa-fade-out 180ms ease-out both;
 *  }
 *  ::view-transition-new(root) {
 *    animation: spa-fade-in 180ms ease-in both;
 *  }
 *
 *  @keyframes spa-fade-out {
 *    to { opacity: 0; transform: translateY(4px); }
 *  }
 *  @keyframes spa-fade-in {
 *    from { opacity: 0; transform: translateY(-4px); }
 *  }
 *
 *  html.spa-navigating {
 *    cursor: progress;
 *  }
 *
 * ═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
 *  USAGE EXAMPLE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  <!-- Just include the script. All <a href> links are handled automatically. -->
 *  <script src="/spa-router.js" defer></script>
 *
 *  <script>
 *    // Re-bind custom listeners after every page swap:
 *    SPARouter.on('afterRender', (url, container) => {
 *      // e.g. re-initialize carousels, charts, gesture handlers
 *      initSwipeListeners(container);
 *      initLazyImages(container);
 *    });
 *
 *    // Cancel navigation conditionally:
 *    SPARouter.on('beforeNavigate', (from, to) => {
 *      if (hasUnsavedChanges()) {
 *        return confirm('You have unsaved changes. Leave?') ? undefined : false;
 *      }
 *    });
 *
 *    // Custom error handling:
 *    SPARouter.on('onError', (err, url) => {
 *      showToast(`Failed to load ${url}`);
 *    });
 *
 *    // Programmatic navigation:
 *    SPARouter.navigate('/dashboard');
 *
 *    // Skip interception on a specific link:
 *    // <a href="/external" data-spa-ignore>Normal link</a>
 *  </script>
 *
 * ═══════════════════════════════════════════════════════════════════════════ */
