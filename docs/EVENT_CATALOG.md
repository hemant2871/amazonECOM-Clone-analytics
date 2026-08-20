# E-Commerce Event Catalog

This catalog documents the exact schemas, parameters, triggers, and JSON payloads for every analytics event implemented in the Amazon Clone application.

---

## 1. core events

### page_view
- **Trigger**: Fired when the active screen panel is toggled.
- **Parameters**:
  - `page_location`: full URL address
  - `page_path`: active route mapping path (e.g. `/cart`)
  - `page_title`: display title
- **Payload Example**:
  ```json
  {
    "event": "page_view",
    "page_location": "http://localhost:3000/cart",
    "page_path": "/cart",
    "page_title": "Shopping Cart"
  }
  ```

---

## 2. E-Commerce Enhanced Events

### view_item_list
- **Trigger**: Render home products grid or search query grids.
- **Payload Example**:
  ```json
  {
    "event": "view_item_list",
    "ecommerce": {
      "item_list_id": "homepage_grid",
      "item_list_name": "Homepage Featured Items",
      "items": [
        {
          "item_id": "P001",
          "item_name": "Amazon Echo Dot (5th Gen)",
          "item_category": "Electronics",
          "item_brand": "Amazon",
          "price": 4499,
          "index": 1
        }
      ]
    }
  }
  ```

### select_item
- **Trigger**: Click product details.
- **Payload Example**:
  ```json
  {
    "event": "select_item",
    "ecommerce": {
      "item_list_id": "homepage_grid",
      "item_list_name": "Homepage Featured Items",
      "items": [
        {
          "item_id": "P001",
          "item_name": "Amazon Echo Dot (5th Gen)",
          "item_category": "Electronics",
          "item_brand": "Amazon",
          "price": 4499,
          "index": 1
        }
      ]
    }
  }
  ```

### view_item
- **Trigger**: Product details view screen is shown.
- **Payload Example**:
  ```json
  {
    "event": "view_item",
    "ecommerce": {
      "currency": "INR",
      "value": 4499,
      "items": [
        {
          "item_id": "P001",
          "item_name": "Amazon Echo Dot (5th Gen)",
          "item_category": "Electronics",
          "item_brand": "Amazon",
          "price": 4499
        }
      ]
    }
  }
  ```

### add_to_cart
- **Trigger**: User clicks "Add to Cart" and state completes update.
- **Payload Example**:
  ```json
  {
    "event": "add_to_cart",
    "ecommerce": {
      "currency": "INR",
      "value": 4499,
      "items": [
        {
          "item_id": "P001",
          "item_name": "Amazon Echo Dot (5th Gen)",
          "item_category": "Electronics",
          "item_brand": "Amazon",
          "price": 4499,
          "quantity": 1
        }
      ]
    }
  }
  ```

### remove_from_cart
- **Trigger**: User clicks Delete on a cart card.
- **Payload Example**:
  ```json
  {
    "event": "remove_from_cart",
    "ecommerce": {
      "currency": "INR",
      "value": 4499,
      "items": [
        {
          "item_id": "P001",
          "item_name": "Amazon Echo Dot (5th Gen)",
          "item_category": "Electronics",
          "item_brand": "Amazon",
          "price": 4499,
          "quantity": 1
        }
      ]
    }
  }
  ```

### view_cart
- **Trigger**: User opens cart page.
- **Payload Example**:
  ```json
  {
    "event": "view_cart",
    "ecommerce": {
      "currency": "INR",
      "value": 4499,
      "items": [
        {
          "item_id": "P001",
          "item_name": "Amazon Echo Dot (5th Gen)",
          "item_category": "Electronics",
          "item_brand": "Amazon",
          "price": 4499,
          "quantity": 1
        }
      ]
    }
  }
  ```

### begin_checkout
- **Trigger**: User clicks "Proceed to Buy".
- **Payload Example**:
  ```json
  {
    "event": "begin_checkout",
    "ecommerce": {
      "currency": "INR",
      "value": 4499,
      "items": [
        {
          "item_id": "P001",
          "item_name": "Amazon Echo Dot (5th Gen)",
          "item_category": "Electronics",
          "item_brand": "Amazon",
          "price": 4499,
          "quantity": 1
        }
      ]
    }
  }
  ```

### add_shipping_info
- **Trigger**: Submitting shipping details form successfully.
- **Payload Example**:
  ```json
  {
    "event": "add_shipping_info",
    "ecommerce": {
      "currency": "INR",
      "value": 4499,
      "shipping_tier": "Standard Home Delivery",
      "items": [
        {
          "item_id": "P001",
          "item_name": "Amazon Echo Dot (5th Gen)",
          "item_category": "Electronics",
          "item_brand": "Amazon",
          "price": 4499,
          "quantity": 1
        }
      ]
    }
  }
  ```

### add_payment_info
- **Trigger**: Submitting payment details form successfully.
- **Payload Example**:
  ```json
  {
    "event": "add_payment_info",
    "ecommerce": {
      "currency": "INR",
      "value": 4499,
      "payment_type": "UPI",
      "items": [
        {
          "item_id": "P001",
          "item_name": "Amazon Echo Dot (5th Gen)",
          "item_category": "Electronics",
          "item_brand": "Amazon",
          "price": 4499,
          "quantity": 1
        }
      ]
    }
  }
  ```

### purchase
- **Trigger**: Backend order created and returns transaction data.
- **Payload Example**:
  ```json
  {
    "event": "purchase",
    "ecommerce": {
      "transaction_id": "TXN-1724185200000-8432",
      "affiliation": "Amazon Clone Online Store",
      "currency": "INR",
      "value": 5459,
      "tax": 810,
      "shipping": 150,
      "coupon": "",
      "items": [
        {
          "item_id": "P001",
          "item_name": "Amazon Echo Dot (5th Gen)",
          "item_category": "Electronics",
          "item_brand": "Amazon",
          "price": 4499,
          "quantity": 1
        }
      ]
    }
  }
  ```

---

## 3. Custom Interactions

### search
- **Trigger**: Search query executed.
- **Payload Example**:
  ```json
  {
    "event": "search",
    "search_term": "Echo Dot"
  }
  ```

### login
- **Trigger**: Sign in form submitted.
- **Payload Example**:
  ```json
  {
    "event": "login",
    "method": "Mock Credentials"
  }
  ```

### sign_up
- **Trigger**: Create Account form submitted.
- **Payload Example**:
  ```json
  {
    "event": "sign_up",
    "method": "Mock Registration"
  }
  ```
