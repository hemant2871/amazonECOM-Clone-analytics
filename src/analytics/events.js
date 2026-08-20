import { pushToDataLayer } from './dataLayer.js';

/**
 * Tracks a page view for SPA routes.
 * @param {string} pagePath - The virtual path of the active screen (e.g. "/cart", "/product-detail")
 * @param {string} pageTitle - The display title of the active screen
 */
export function trackPageView(pagePath, pageTitle) {
  pushToDataLayer({
    event: "page_view",
    page_location: window.location.origin + pagePath,
    page_path: pagePath,
    page_title: pageTitle
  });
}

/**
 * Tracks a site search query.
 * @param {string} searchTerm - Raw string query (sanitized of PII automatically)
 */
export function trackSearch(searchTerm) {
  if (!searchTerm) return;
  
  // Basic security sanitization to remove email/phone lookalikes from search terms
  let sanitizedTerm = searchTerm.trim();
  // Simple regex to mask email-like structures
  sanitizedTerm = sanitizedTerm.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_MASKED]");
  // Simple regex to mask phone-like structures (7+ digits)
  sanitizedTerm = sanitizedTerm.replace(/\b\d{7,15}\b/g, "[PHONE_MASKED]");

  pushToDataLayer({
    event: "search",
    search_term: sanitizedTerm
  });
}

/**
 * Tracks a login event.
 * @param {string} [method="Email/Password"] - Authentication method (e.g., "Mock Credentials", "Google OAuth")
 */
export function trackLogin(method = "Mock Credentials") {
  pushToDataLayer({
    event: "login",
    method: method
  });
}

/**
 * Tracks a signup event.
 * @param {string} [method="Email/Password"] - Authentication method
 */
export function trackSignup(method = "Mock Credentials") {
  pushToDataLayer({
    event: "sign_up",
    method: method
  });
}

/**
 * Tracks interactive form submissions (non-checkout forms).
 * @param {string} formName - Descriptive identifier of the form
 */
export function trackFormSubmit(formName) {
  pushToDataLayer({
    event: "form_submit",
    form_name: formName
  });
}

/**
 * Tracks generic interactive button clicks.
 * @param {string} buttonLocation - Area of page where button lives
 * @param {string} buttonText - Label text of button
 */
export function trackButtonClick(buttonLocation, buttonText) {
  pushToDataLayer({
    event: "button_click",
    button_location: buttonLocation,
    button_text: buttonText
  });
}
