# Amazon Clone — E-commerce Analytics & GA4/GTM Implementation

A professional, production-ready Amazon Clone Single Page Application (SPA) built with Vanilla JavaScript, HTML5, CSS3, and a Node.js Express backend. This project implements enterprise-grade analytics tracking including Google Tag Manager (GTM), Google Analytics 4 (GA4), Enhanced Ecommerce Data Layer, conversion funnel tracking, checkout validation, duplicate purchase prevention, and a custom developer debugging console.

---

## 🚀 Features

- **Single Page Application (SPA)**: Custom frontend router handling smooth screen transitions without browser page reloads.
- **Backend Order System**: Express server serving static assets and exposing `/api/orders` to validate pricing integrity (backend source of truth), calculate taxes/shipping, and generate unique transaction IDs.
- **Enhanced Ecommerce (GA4)**: Standardized e-commerce tracking covering all 7 stages of the purchase funnel.
- **PII & Privacy Protection**: Automatic scrubbing and masking of passwords, credit cards, UPI profiles, and emails to prevent telemetry leaks.
- **Duplicate Purchase Prevention**: Local storage caching of transaction IDs on order confirmation pages to block duplicate events on reloads or screen revisits.
- **Live Debug Console Panel**: Visual, slide-up UI overlay displaying telemetry events and payloads in real-time when running under debug configurations.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES Modules)
- **Backend**: Node.js, Express, Cors, Dotenv
- **Analytics**: Google Tag Manager (GTM), Google Analytics 4 (GA4)
- **Deployment**: Vercel-ready server config

---

## 📂 Project Structure

```
├── .env.example                # Template for configurations
├── .gitignore                  # Git excludes
├── package.json                # Project dependencies and startup scripts
├── server.js                   # Node.js Express API server
├── index.html                  # Core HTML structure & SPA screens
├── style.css                   # Custom styles, responsive grid, debug console UI
├── src/
│   ├── app.js                  # Main SPA controller, routing, cart logic
│   └── analytics/
│       ├── gtm.js              # Async GTM script injection
│       ├── dataLayer.js        # Safe dataLayer wrapper & PII check
│       ├── ecommerce.js        # Enhanced Ecommerce event builders
│       └── events.js           # Custom interactions page views
└── docs/
    ├── TRACKING_PLAN.md        # E-commerce tracking plan
    ├── IMPLEMENTATION_REQUIREMENTS.md  # Engineering specs
    ├── VALIDATION_STEPS.md     # QA manual checklist
    ├── EVENT_CATALOG.md        # Event payload schemas
    └── ANALYTICS_ARCHITECTURE.md  # Layered flow diagram
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:
```env
PORT=3000
VITE_GTM_ID=GTM-XXXXXXX
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_ANALYTICS_DEBUG=true
```

---

## 📋 Tracking Plan

The application measures the following events:

| User Action | GA4 Event | Main Parameters | Purpose |
| :--- | :--- | :--- | :--- |
| Product list viewed | `view_item_list` | `items`, `item_list_name` | Analyze product listing CTR |
| Product selected | `select_item` | `items` | Track initial interest |
| Product viewed | `view_item` | `items`, `value`, `currency` | Detail page engagement |
| Add to cart | `add_to_cart` | `items`, `value`, `currency` | Purchase intent signal |
| Remove from cart | `remove_from_cart`| `items`, `value` | Cart friction tracking |
| Cart viewed | `view_cart` | `items`, `value` | Checkout drop-off marker |
| Checkout started | `begin_checkout` | `items`, `value` | Funnel entry rate |
| Shipping submitted | `add_shipping_info`| `items`, `shipping_tier` | Shipping method tracking |
| Payment submitted | `add_payment_info` | `items`, `payment_type` | Payment choice tracking |
| Purchase completed | `purchase` | `transaction_id`, `value`, `tax` | Revenue conversion |
| Search performed | `search` | `search_term` | Customer search intent |
| User login | `login` | `method` | Active user tracking |
| User signup | `sign_up` | `method` | Registration conversion |

---

## 🏁 Installation & Startup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your web browser.

---

## 🔍 Validation & Testing

- **Console Validation**: In Google Chrome, press `F12` to open DevTools. Observe formatted `[Analytics]` logs outputting details for every UI action.
- **Debug Panel Validation**: Expand the Neon-Green console overlay in the bottom right corner of the page. Perform clicks or complete checkouts to see formatted JSON arrays load live.
- **Duplicate Prevention Test**: Walk through shipping details, choose UPI/Mock Card payment, click Place Order. View the `purchase` event payload. Press `F5` to reload the page; verify that only the `page_view` fires and `purchase` remains silent.
- **Fail-Safe Test**: Change GTM container to empty in `.env`. Restart the server. Verify that checkouts, product details, cart additions, and log-ins operate cleanly without errors.
