/**
 * Google Tag Manager Initialization Module
 */

let isGTMInitialized = false;
let debugMode = false;

/**
 * Initializes Google Tag Manager and inserts the container snippet into the DOM.
 * @param {string} gtmId - The GTM Container ID (e.g. GTM-XXXXXX)
 * @param {boolean} debug - Enable console logs for analytics events
 */
export function initializeGTM(gtmId, debug = false) {
  debugMode = debug;

  if (isGTMInitialized) {
    if (debugMode) console.log("[Analytics Debug] GTM is already initialized.");
    return;
  }

  if (!gtmId) {
    if (debugMode) {
      console.warn("[Analytics Debug] No GTM Container ID provided. Tracking triggers will run in developer log-only mode.");
    }
    isGTMInitialized = true;
    return;
  }

  try {
    // Standard Google Tag Manager Snippet
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', gtmId);

    isGTMInitialized = true;
    if (debugMode) console.log(`[Analytics Debug] GTM Container initialized successfully with ID: ${gtmId}`);
  } catch (error) {
    console.error("[Analytics] Failed to initialize GTM:", error);
  }
}

/**
 * Checks if GTM has been initialized.
 * @returns {boolean}
 */
export function isInitialized() {
  return isGTMInitialized;
}
