import { pushToDataLayer, clearEcommerce } from './dataLayer.js';

/**
 * Standardizes an item to the Google Analytics 4 Ecommerce schema.
 * @param {object} item - Raw product object
 * @param {number} [index] - Optional list index
 * @param {number} [quantity] - Optional selection/cart quantity
 * @returns {object} GA4 formatted item
 */
function formatGA4Item(item, index, quantity) {
  return {
    item_id: String(item.id || item.productId || item.item_id),
    item_name: item.name || item.item_name,
    item_category: item.category || item.item_category,
    item_category2: item.subcategory || item.item_category2 || "",
    item_brand: item.brand || item.item_brand || "Amazon",
    price: Number(item.price),
    index: index !== undefined ? Number(index) : undefined,
    quantity: quantity !== undefined ? Number(quantity) : (item.quantity !== undefined ? Number(item.quantity) : 1)
  };
}

/**
 * Calculates total value of a list of items.
 * @param {Array} items 
 * @returns {number}
 */
function calculateTotalValue(items) {
  return items.reduce((sum, item) => sum + (Number(item.price) * (Number(item.quantity) || 1)), 0);
}

/**
 * Tracks viewing a list of products.
 * @param {Array} items - List of raw product items
 * @param {string} listId - ID of the listing (e.g. "search_results")
 * @param {string} listName - Name of the listing (e.g. "Search Results")
 */
export function trackViewItemList(items, listId = "homepage_grid", listName = "Homepage Featured") {
  clearEcommerce();
  pushToDataLayer({
    event: "view_item_list",
    ecommerce: {
      item_list_id: listId,
      item_list_name: listName,
      items: items.map((item, idx) => formatGA4Item(item, idx + 1))
    }
  });
}

/**
 * Tracks selecting/clicking a product from a list.
 * @param {object} item - Raw product clicked
 * @param {number} index - 1-indexed position in list
 * @param {string} listId - List container ID
 * @param {string} listName - List container Name
 */
export function trackSelectItem(item, index, listId = "homepage_grid", listName = "Homepage Featured") {
  clearEcommerce();
  pushToDataLayer({
    event: "select_item",
    ecommerce: {
      item_list_id: listId,
      item_list_name: listName,
      items: [formatGA4Item(item, index)]
    }
  });
}

/**
 * Tracks viewing a product detail page.
 * @param {object} item - Raw product viewed
 */
export function trackViewItem(item) {
  clearEcommerce();
  const ga4Item = formatGA4Item(item);
  pushToDataLayer({
    event: "view_item",
    ecommerce: {
      currency: "INR",
      value: ga4Item.price,
      items: [ga4Item]
    }
  });
}

/**
 * Tracks adding an item to the shopping cart.
 * @param {object} item - Raw product details
 * @param {number} quantity - Quantity added
 */
export function trackAddToCart(item, quantity = 1) {
  clearEcommerce();
  const ga4Item = formatGA4Item(item, undefined, quantity);
  pushToDataLayer({
    event: "add_to_cart",
    ecommerce: {
      currency: "INR",
      value: ga4Item.price * ga4Item.quantity,
      items: [ga4Item]
    }
  });
}

/**
 * Tracks removing an item from the shopping cart.
 * @param {object} item - Raw product details
 * @param {number} quantity - Quantity removed
 */
export function trackRemoveFromCart(item, quantity = 1) {
  clearEcommerce();
  const ga4Item = formatGA4Item(item, undefined, quantity);
  pushToDataLayer({
    event: "remove_from_cart",
    ecommerce: {
      currency: "INR",
      value: ga4Item.price * ga4Item.quantity,
      items: [ga4Item]
    }
  });
}

/**
 * Tracks opening and viewing the shopping cart page.
 * @param {Array} items - List of items in the cart
 */
export function trackViewCart(items) {
  clearEcommerce();
  const ga4Items = items.map(item => formatGA4Item(item));
  pushToDataLayer({
    event: "view_cart",
    ecommerce: {
      currency: "INR",
      value: calculateTotalValue(ga4Items),
      items: ga4Items
    }
  });
}

/**
 * Tracks beginning the checkout process.
 * @param {Array} items - List of items in the cart at checkout start
 */
export function trackBeginCheckout(items) {
  clearEcommerce();
  const ga4Items = items.map(item => formatGA4Item(item));
  pushToDataLayer({
    event: "begin_checkout",
    ecommerce: {
      currency: "INR",
      value: calculateTotalValue(ga4Items),
      items: ga4Items
    }
  });
}

/**
 * Tracks submitting shipping details during checkout.
 * @param {Array} items - List of items being checked out
 * @param {string} shippingTier - Method of shipping (e.g. "Standard Delivery", "Free Premium Shipping")
 */
export function trackShippingInfo(items, shippingTier = "Standard") {
  clearEcommerce();
  const ga4Items = items.map(item => formatGA4Item(item));
  pushToDataLayer({
    event: "add_shipping_info",
    ecommerce: {
      currency: "INR",
      value: calculateTotalValue(ga4Items),
      shipping_tier: shippingTier,
      items: ga4Items
    }
  });
}

/**
 * Tracks submitting payment details during checkout.
 * @param {Array} items - List of items being checked out
 * @param {string} paymentType - Selected payment method (e.g. "UPI", "Credit Card")
 */
export function trackPaymentInfo(items, paymentType = "Mock Gateway") {
  clearEcommerce();
  const ga4Items = items.map(item => formatGA4Item(item));
  pushToDataLayer({
    event: "add_payment_info",
    ecommerce: {
      currency: "INR",
      value: calculateTotalValue(ga4Items),
      payment_type: paymentType,
      items: ga4Items
    }
  });
}

/**
 * Tracks order purchase completion.
 * @param {object} order - Clean order details returned from the backend
 */
export function trackPurchase(order) {
  clearEcommerce();
  
  // Format items with backend details
  const ga4Items = order.items.map(item => ({
    item_id: String(item.item_id),
    item_name: item.item_name,
    item_category: item.item_category,
    item_category2: item.item_category2 || "",
    item_brand: item.item_brand || "Amazon",
    price: Number(item.price),
    quantity: Number(item.quantity)
  }));

  pushToDataLayer({
    event: "purchase",
    ecommerce: {
      transaction_id: String(order.orderId),
      affiliation: "Amazon Clone Online Store",
      currency: "INR",
      value: Number(order.total),
      tax: Number(order.tax),
      shipping: Number(order.shipping),
      coupon: order.discountCode || "",
      items: ga4Items
    }
  });
}
