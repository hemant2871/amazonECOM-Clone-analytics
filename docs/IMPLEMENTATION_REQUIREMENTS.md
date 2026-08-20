# Technical Implementation Requirements

This document details the engineering specifications, coding rules, backend integrations, and privacy boundaries for the upgraded Amazon Clone.

---

## 1. Frontend Specifications

### SPA Routing & Page Telemetry
- SPA routing must be virtual. Changing tabs or screen panels must invoke the `trackPageView(pagePath, pageTitle)` helper.
- The default browser reload must restart the routing at `/` (`home`), but cached carts/auths should restore from `localStorage`.
- Direct page views must not trigger secondary duplicate events when components mount or render.

### Cart Mutations
- The global cart array must contain objects with keys: `productId`, `name`, `category`, `brand`, `price`, `image`, and `quantity`.
- Changing quantities or items must immediately recalculate subtotals on the client side for visual display, but the final purchase event payload values must use backend values.

---

## 2. Backend Specifications

### Order Validation Endpoint (`POST /api/orders`)
- The server is the absolute source of truth for pricing. Client-side price modifications must be prevented by looking up product prices from the server database.
- A flat tax rate of 18% GST and a flat shipping rate of ₹150 (free shipping above ₹4999) must be applied.
- The endpoint must generate a unique Transaction ID matching the syntax: `TXN-{timestamp}-{random_4_digits}`.

---

## 3. Analytics & GTM Specifications

### Container Script Injection
- GTM must load asynchronously using the `VITE_GTM_ID` environment variable.
- The `dataLayer` must be initialized as `window.dataLayer = window.dataLayer || []`.
- Before pushing any e-commerce event to the dataLayer, the previous e-commerce states must be explicitly cleared using:
  ```javascript
  window.dataLayer.push({ ecommerce: null });
  ```

### Data Security (PII Protection)
- Accidental telemetry tracking of password inputs, authentication tokens, or payment card variables is strictly forbidden.
- The dataLayer helper includes a security check scanning for PII keywords to alert developers during testing.

---

## 4. Failure Isolation & Performance

- The application must remain fully functional if the GTM script fails to load, is blocked by browser extensions, or if `VITE_GTM_ID` is missing.
- In developer debug mode (`VITE_ANALYTICS_DEBUG=true`), all events must trigger logs to both the browser console and the custom interactive overlay dashboard in the UI.
