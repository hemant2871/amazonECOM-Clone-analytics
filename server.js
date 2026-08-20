const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));
// Also explicitly serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Static Product Database (Source of Truth)
const PRODUCTS = {
  "P001": {
    id: "P001",
    name: "Amazon Echo Dot (5th Gen)",
    category: "Electronics",
    subcategory: "Smart Speakers",
    brand: "Amazon",
    price: 4499,
    image: "box_eight.jpg",
    rating: 4.5,
    stock: 50
  },
  "P002": {
    id: "P002",
    name: "Bowflex SelectTech Dumbbells",
    category: "Fitness",
    subcategory: "Weights",
    brand: "Bowflex",
    price: 12999,
    image: "box_seven.jpg",
    rating: 4.8,
    stock: 15
  },
  "P003": {
    id: "P003",
    name: "Green Soul Ergonomic Chair",
    category: "Furniture",
    subcategory: "Chairs",
    brand: "Green Soul",
    price: 8999,
    image: "box_six.jpg",
    rating: 4.6,
    stock: 25
  },
  "P004": {
    id: "P004",
    name: "Corelle Dinnerware Set (6pc)",
    category: "Kitchen",
    subcategory: "Plates",
    brand: "Corelle",
    price: 5999,
    image: "box_five.jpg",
    rating: 4.7,
    stock: 30
  },
  "P005": {
    id: "P005",
    name: "Sony WH-1000XM4 Headphones",
    category: "Electronics",
    subcategory: "Audio",
    brand: "Sony",
    price: 19990,
    image: "box_four.jpg",
    rating: 4.9,
    stock: 40
  },
  "P006": {
    id: "P006",
    name: "Tupperware Modular Containers",
    category: "Kitchen",
    subcategory: "Storage",
    brand: "Tupperware",
    price: 1499,
    image: "box_three.jpg",
    rating: 4.4,
    stock: 100
  },
  "P007": {
    id: "P007",
    name: "Adidas Men's Classic Sport Tee",
    category: "Apparel",
    subcategory: "Activewear",
    brand: "Adidas",
    price: 1199,
    image: "box_two.jpg",
    rating: 4.2,
    stock: 200
  },
  "P008": {
    id: "P008",
    name: "Bosch Icon Wiper Blades (Set)",
    category: "Automotive",
    subcategory: "Accessories",
    brand: "Bosch",
    price: 799,
    image: "box_one.jpg",
    rating: 4.5,
    stock: 80
  }
};

// In-memory orders store
const orders = [];

// Endpoint to fetch client-side configurations
app.get('/api/config', (req, res) => {
  res.json({
    gtmId: process.env.VITE_GTM_ID || '',
    ga4MeasurementId: process.env.VITE_GA4_MEASUREMENT_ID || '',
    analyticsDebug: process.env.VITE_ANALYTICS_DEBUG === 'true'
  });
});

// Endpoint to fetch product catalog
app.get('/api/products', (req, res) => {
  res.json(Object.values(PRODUCTS));
});

// Endpoint to validate and create orders
app.post('/api/orders', (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid structure." });
    }

    let subtotal = 0;
    const validatedItems = [];

    // Verify prices and existence against product DB
    for (const item of items) {
      const product = PRODUCTS[item.productId || item.id];
      if (!product) {
        return res.status(400).json({ error: `Product with ID ${item.productId || item.id} does not exist.` });
      }

      const qty = parseInt(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ error: `Invalid quantity for product ${product.name}.` });
      }

      // Check stock limits (mock logic)
      if (qty > product.stock) {
        return res.status(400).json({ error: `Requested quantity for ${product.name} exceeds available stock of ${product.stock}.` });
      }

      // Backend price verification
      subtotal += product.price * qty;

      validatedItems.push({
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        item_category2: product.subcategory,
        item_brand: product.brand,
        price: product.price,
        quantity: qty
      });
    }

    // Calculations (source of truth)
    const tax = Math.round(subtotal * 0.18); // 18% GST standard
    const shipping = subtotal >= 4999 ? 0 : 150; // Free shipping above ₹4999
    const discount = 0; // No active coupons for now
    const total = subtotal + tax + shipping - discount;

    const orderId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const order = {
      orderId,
      items: validatedItems,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      currency: "INR",
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || "MOCK_PAYMENT",
      paymentStatus: "Paid",
      orderStatus: "Processing",
      createdAt: new Date().toISOString()
    };

    orders.push(order);

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal server error while processing order." });
  }
});

// Run server
app.listen(PORT, () => {
  console.log(`Amazon e-com server is running on http://localhost:${PORT}`);
});
