# Analytics QA & Validation Steps

This validation document defines the specific QA testing procedures to verify the correctness of the GTM, GA4, Enhanced Ecommerce, and custom events tracking.

---

## 1. Local Verification Setup

1. Copy `.env.example` to `.env` and configure:
   ```env
   VITE_GTM_ID=GTM-TEST1234
   VITE_ANALYTICS_DEBUG=true
   ```
2. Run the application:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in Google Chrome and press `F12` to open DevTools Console.

---

## 2. Interactive Testing Checklist

For each user action, verify the expected dataLayer event, parameters, and verification tools.

| Action | Target Event | Crucial Parameters | Validation Method | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **Open Site** | `page_view` | `page_path: "/"`, `page_title` | Console logs & Debug Panel | `page_view` fires once. |
| **Open Site** | `view_item_list` | `item_list_name: "Homepage Featured"` | Console logs & Debug Panel | Contains list of all 8 home items. |
| **Search "Sony"** | `search` | `search_term: "Sony"` | Console logs & Debug Panel | Custom event fires with term text. |
| **Search Results** | `view_item_list` | `item_list_name: "Search Results: Sony"`| Console logs & Debug Panel | Contains only Sony product array. |
| **Click Product** | `select_item` | `items: [ { item_id: "P005", ... } ]` | Console logs & Debug Panel | Fires select event with item details. |
| **View Details** | `view_item` | `currency: "INR"`, `value: 19990` | Console logs & Debug Panel | Detail page tracking fires with value. |
| **Click Add to Cart**| `add_to_cart` | `items: [ { price: 19990, quantity: 1 } ]` | Console logs & Debug Panel | Fired only after click confirmation. |
| **Open Cart** | `view_cart` | `currency: "INR"`, `value: 19990` | Console logs & Debug Panel | Opened cart page matches total values. |
| **Click Delete** | `remove_from_cart`| `value: 19990`, `items: [ { qty: 1 } ]` | Console logs & Debug Panel | Removes product and updates totals. |
| **Start Checkout** | `begin_checkout` | `items`, `value: [total_sum]` | Console logs & Debug Panel | Fires upon checkout funnel entry. |
| **Submit Address** | `add_shipping_info`| `shipping_tier: "Standard Home Delivery"` | Console logs & Debug Panel | Address fields are tracked without PII. |
| **Submit Payment** | `add_payment_info` | `payment_type: "UPI"` | Console logs & Debug Panel | UPI ID / Card parameters are omitted. |
| **Place Order** | `purchase` | `transaction_id`, `value`, `tax`, `shipping` | Console logs & Debug Panel | Matches backend payload exactly. |
| **Page Refresh** | — | — | Console logs & Debug Panel | Re-visiting confirmation does not fire `purchase` again. |

---

## 3. Duplicate Purchase Prevention Verification

1. Navigate through the complete checkout funnel and complete a test purchase.
2. Observe the `purchase` event firing in the console and the debug console panel.
3. Refresh the order confirmation screen (`F5`).
4. **Validation Check**: Verify that `page_view` fires but **NO secondary purchase event fires**.
5. Inspect `localStorage.getItem('processed_transactions')` in DevTools Application tab. Verify it contains the order's Transaction ID.

---

## 4. Google Tag Manager Preview Mode Validation

1. Open your GTM workspace and click **Preview**.
2. Connect to `http://localhost:3000`.
3. Perform the purchase funnel flow.
4. Verify in the Tag Assistant window that:
   - All events appear in the left-hand timeline.
   - Standard GTM triggers fire their corresponding GA4 tags (e.g. `GA4 - Add to Cart` fires on `add_to_cart` event).
   - E-commerce variables are correctly resolved from the dataLayer.
