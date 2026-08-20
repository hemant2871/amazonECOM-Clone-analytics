/**
 * Data Layer Architecture Helper
 */

// Initialize window.dataLayer safely
window.dataLayer = window.dataLayer || [];

let debugMode = false;

/**
 * Enable or disable debug logging for dataLayer interactions.
 * @param {boolean} debug 
 */
export function setDebugMode(debug) {
  debugMode = debug;
}

/**
 * Core utility to push a payload to the window.dataLayer array.
 * Includes PII sanitization check and logs details when debug mode is enabled.
 * @param {object} payload - The telemetry data payload
 */
export function pushToDataLayer(payload) {
  try {
    // Basic validation
    if (!payload || typeof payload !== 'object') {
      console.error("[Analytics] Tried to push an invalid payload to the dataLayer:", payload);
      return;
    }

    // PII Security check - raise warnings if accidental PII leak occurs
    const piiKeys = ['password', 'email', 'phone', 'token', 'creditcard', 'cvv', 'address'];
    const serializedPayload = JSON.stringify(payload).toLowerCase();
    for (const key of piiKeys) {
      if (serializedPayload.includes(`"${key}":`) && !serializedPayload.includes(`"shippingaddress":`) && !serializedPayload.includes(`"billingaddress":`)) {
        console.warn(`[Analytics Warning] Potential PII detected in event payload: ${key}`);
      }
    }

    // Push to actual GTM Data Layer
    window.dataLayer.push(payload);

    // Logging for Debug Console & Custom UI panel
    if (debugMode) {
      console.log(`[Analytics] ${payload.event || 'page_view'}`, payload);
    }

    // Dispatch custom DOM event for the frontend's dev-only debug panel
    const customEvent = new CustomEvent('analytics_event_fired', {
      detail: payload
    });
    window.dispatchEvent(customEvent);

  } catch (error) {
    console.error("[Analytics] Error pushing event to dataLayer:", error);
  }
}

/**
 * Clears the GTM/GA4 ecommerce object state to prevent stale values 
 * on subsequent ecommerce interactions.
 */
export function clearEcommerce() {
  pushToDataLayer({ ecommerce: null });
}
