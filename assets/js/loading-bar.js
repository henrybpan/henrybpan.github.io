/**
 * Page Loading Bar Component
 * Pure vanilla JavaScript - zero dependencies
 *
 * Features:
 * - Activates on internal link clicks only
 * - Handles browser back/forward navigation
 * - Simulated progress curve for smooth UX
 * - GPU-accelerated animations (60fps target)
 * - Handles edge cases (rapid clicks, bfcache, etc.)
 */

(function() {
  'use strict';

  // Component state
  const state = {
    overlay: null,
    progressBar: null,
    isActive: false,
    progressTimers: [],
    minDisplayTimer: null,
    startTime: 0,
    hasNavigated: false
  };

  // Configuration
  const config = {
    minDisplayTime: 300, // Minimum time to show loading bar (avoid flicker)
    progressSteps: [
      { progress: 30, delay: 100 },
      { progress: 60, delay: 200 },
      { progress: 85, delay: 400 },
      { progress: 95, delay: 800 }
    ]
  };

  /**
   * Initialize the loading bar component
   * Called on DOMContentLoaded
   */
  function init() {
    // Get DOM references
    state.overlay = document.getElementById('page-loading-overlay');
    state.progressBar = state.overlay?.querySelector('.loading-bar-fill');

    if (!state.overlay || !state.progressBar) {
      console.warn('Loading bar elements not found in DOM');
      return;
    }

    // Set up event listeners
    attachEventListeners();
  }

  /**
   * Attach all event listeners
   */
  function attachEventListeners() {
    // Handle link clicks with event delegation
    document.addEventListener('click', handleLinkClick, true);

    // Handle browser back/forward navigation
    window.addEventListener('popstate', handlePopState);

    // Handle page show (bfcache restoration)
    window.addEventListener('pageshow', handlePageShow);

    // Clean up before page unload
    window.addEventListener('beforeunload', cleanup);
  }

  /**
   * Handle link clicks - filter for internal navigation
   * @param {MouseEvent} event - Click event
   */
  function handleLinkClick(event) {
    const link = event.target.closest('a');

    // Ignore if not a link or modified click (ctrl/cmd/middle click)
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) {
      return;
    }

    const href = link.getAttribute('href');

    // Ignore if no href or is a hash link
    if (!href || href.startsWith('#')) {
      return;
    }

    // Ignore external links
    if (isExternalLink(link)) {
      return;
    }

    // Ignore download links and mailto/tel links
    if (link.hasAttribute('download') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')) {
      return;
    }

    // Valid internal navigation - show loading bar
    showLoadingBar();
  }

  /**
   * Check if a link is external (different origin)
   * @param {HTMLAnchorElement} link - Link element
   * @returns {boolean} True if external link
   */
  function isExternalLink(link) {
    // If link has target="_blank", treat as external
    if (link.target === '_blank') {
      return true;
    }

    try {
      const linkUrl = new URL(link.href, window.location.origin);
      return linkUrl.origin !== window.location.origin;
    } catch (e) {
      // Invalid URL, treat as external
      return true;
    }
  }

  /**
   * Handle browser back/forward button navigation
   * Critical for fixing the "stuck on loading screen" bug
   */
  function handlePopState() {
    // User navigated back/forward - hide loading bar immediately
    hideLoadingBar(true);
  }

  /**
   * Handle pageshow event - detects bfcache restoration
   * @param {PageTransitionEvent} event - Page show event
   */
  function handlePageShow(event) {
    // If page was restored from bfcache, ensure loading bar is hidden
    if (event.persisted) {
      hideLoadingBar(true);
    }
  }

  /**
   * Show the loading bar with animated progress
   */
  function showLoadingBar() {
    // If already active, don't restart
    if (state.isActive) {
      return;
    }

    state.isActive = true;
    state.hasNavigated = true;
    state.startTime = Date.now();

    // Reset progress bar
    state.progressBar.className = 'loading-bar-fill';

    // Force reflow to ensure transition works
    void state.progressBar.offsetWidth;

    // Show overlay with fade-in
    state.overlay.classList.add('active');
    state.overlay.setAttribute('aria-busy', 'true');

    // Start simulated progress animation
    startProgressAnimation();
  }

  /**
   * Start the simulated progress animation
   * Uses a realistic curve: fast start, gradual middle, slow end
   */
  function startProgressAnimation() {
    // Clear any existing timers
    clearProgressTimers();

    // Schedule progress steps
    let cumulativeDelay = 0;

    config.progressSteps.forEach((step, index) => {
      cumulativeDelay += step.delay;

      const timer = setTimeout(() => {
        if (state.isActive && state.progressBar) {
          state.progressBar.classList.add(`progress-${step.progress}`);
        }
      }, cumulativeDelay);

      state.progressTimers.push(timer);
    });
  }

  /**
   * Complete the progress animation
   * Called when page actually loads
   */
  function completeProgress() {
    if (!state.isActive || !state.progressBar) {
      return;
    }

    // Clear pending timers
    clearProgressTimers();

    // Jump to 100%
    state.progressBar.className = 'loading-bar-fill progress-100';

    // Wait for animation to complete, then hide
    setTimeout(() => {
      hideLoadingBar();
    }, 300);
  }

  /**
   * Hide the loading bar
   * @param {boolean} immediate - If true, hide immediately without animations
   */
  function hideLoadingBar(immediate = false) {
    if (!state.isActive) {
      return;
    }

    // Ensure minimum display time for smooth UX
    const elapsed = Date.now() - state.startTime;
    const remainingTime = immediate ? 0 : Math.max(0, config.minDisplayTime - elapsed);

    state.minDisplayTimer = setTimeout(() => {
      // Remove active class to trigger fade-out
      state.overlay.classList.remove('active');
      state.overlay.setAttribute('aria-busy', 'false');

      // Reset state after fade-out completes
      setTimeout(() => {
        state.isActive = false;
        state.progressBar.className = 'loading-bar-fill';
        clearProgressTimers();
      }, 200);
    }, remainingTime);
  }

  /**
   * Clear all progress animation timers
   */
  function clearProgressTimers() {
    state.progressTimers.forEach(timer => clearTimeout(timer));
    state.progressTimers = [];

    if (state.minDisplayTimer) {
      clearTimeout(state.minDisplayTimer);
      state.minDisplayTimer = null;
    }
  }

  /**
   * Clean up before page unload
   */
  function cleanup() {
    clearProgressTimers();

    // If we initiated navigation, complete the progress
    if (state.hasNavigated && state.isActive) {
      completeProgress();
    }
  }

  /**
   * Public API - Allow manual control if needed
   */
  window.LoadingBar = {
    show: showLoadingBar,
    hide: hideLoadingBar,
    complete: completeProgress
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already loaded
    init();
  }

  // Auto-complete on page load (handles slow page loads)
  window.addEventListener('load', () => {
    if (state.isActive) {
      completeProgress();
    }
  });

})();
