import { initializeGTM } from './analytics/gtm.js';
import { setDebugMode } from './analytics/dataLayer.js';
import { 
  trackViewItemList, 
  trackSelectItem, 
  trackViewItem, 
  trackAddToCart, 
  trackRemoveFromCart, 
  trackViewCart, 
  trackBeginCheckout, 
  trackShippingInfo, 
  trackPaymentInfo, 
  trackPurchase 
} from './analytics/ecommerce.js';
import { 
  trackPageView, 
  trackSearch, 
  trackLogin, 
  trackSignup, 
  trackButtonClick 
} from './analytics/events.js';

// Application State
const state = {
  products: [],
  cart: [],
  user: null,
  activeRoute: 'home',
  activeCheckoutStep: 1,
  checkoutDetails: {
    shippingAddress: {},
    paymentMethod: 'UPI',
    upiId: '',
    cardNum: '',
    cardExpiry: '',
    cardCvv: ''
  },
  lastOrder: null,
  config: {
    gtmId: '',
    analyticsDebug: false
  }
};

// Global event catalog for SPA pages mapping to virtual paths & titles
const ROUTE_MAP = {
  home: { path: '/', title: 'Amazon Clone - E-commerce Store' },
  search: { path: '/search', title: 'Search Results' },
  'product-detail': { path: '/product', title: 'Product Details' },
  cart: { path: '/cart', title: 'Shopping Cart' },
  checkout: { path: '/checkout', title: 'Secure Checkout' },
  confirmation: { path: '/order-confirmation', title: 'Order Placement Success' },
  login: { path: '/signin', title: 'Amazon Sign In' },
  signup: { path: '/signup', title: 'Amazon Registration' }
};

// ==========================================
// 1. Initial Launch Setup
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load local cart data
    const savedCart = localStorage.getItem('amazon_clone_cart');
    if (savedCart) {
      state.cart = JSON.parse(savedCart);
      updateCartBadge();
    }

    // Load mock user session
    const savedUser = localStorage.getItem('amazon_clone_user');
    if (savedUser) {
      state.user = JSON.parse(savedUser);
      updateUserHeader();
    }

    // 1. Fetch Environment Configurations from Node Server
    const configRes = await fetch('/api/config');
    state.config = await configRes.json();

    // 2. Initialize Analytics Infrastructure
    setDebugMode(state.config.analyticsDebug);
    initializeGTM(state.config.gtmId, state.config.analyticsDebug);

    // Show debug panel if enabled
    if (state.config.analyticsDebug) {
      const debugPanel = document.getElementById('analytics-debug-panel');
      if (debugPanel) {
        debugPanel.style.display = 'flex';
        document.getElementById('debug-gtm-status').textContent = state.config.gtmId ? 'Active' : 'Log Only';
        document.getElementById('debug-gtm-status').className = 'status-indicator ' + (state.config.gtmId ? 'ready' : 'log-only');
      }
    }

    // 3. Fetch Product Database from Node Server
    const productsRes = await fetch('/api/products');
    state.products = await productsRes.json();

    // 4. Render home screen & bind event listeners
    renderHomeGrid();
    setupEventBindings();

    // First page_view event
    navigate('home');

  } catch (error) {
    console.error("[Amazon App] Initialization failed:", error);
    // Graceful fallback for offline usage / static files served directly without Express
    fallbackInitialization();
  }
});

// Graceful offline fallback
function fallbackInitialization() {
  console.warn("[Amazon App] Using offline fallback. Backend operations are simulated.");
  state.products = [
    { id: "P001", name: "Amazon Echo Dot (5th Gen)", category: "Electronics", subcategory: "Smart Speakers", brand: "Amazon", price: 4499, image: "box_eight.jpg", rating: 4.5, stock: 50 },
    { id: "P002", name: "Bowflex SelectTech Dumbbells", category: "Fitness", subcategory: "Weights", brand: "Bowflex", price: 12999, image: "box_seven.jpg", rating: 4.8, stock: 15 },
    { id: "P003", name: "Green Soul Ergonomic Chair", category: "Furniture", subcategory: "Chairs", brand: "Green Soul", price: 8999, image: "box_six.jpg", rating: 4.6, stock: 25 },
    { id: "P004", name: "Corelle Dinnerware Set (6pc)", category: "Kitchen", subcategory: "Plates", brand: "Corelle", price: 5999, image: "box_five.jpg", rating: 4.7, stock: 30 },
    { id: "P005", name: "Sony WH-1000XM4 Headphones", category: "Electronics", subcategory: "Audio", brand: "Sony", price: 19990, image: "box_four.jpg", rating: 4.9, stock: 40 },
    { id: "P006", name: "Tupperware Modular Containers", category: "Kitchen", subcategory: "Storage", brand: "Tupperware", price: 1499, image: "box_three.jpg", rating: 4.4, stock: 100 },
    { id: "P007", name: "Adidas Men's Classic Sport Tee", category: "Apparel", subcategory: "Activewear", brand: "Adidas", price: 1199, image: "box_two.jpg", rating: 4.2, stock: 200 },
    { id: "P008", name: "Bosch Icon Wiper Blades (Set)", category: "Automotive", subcategory: "Accessories", brand: "Bosch", price: 799, image: "box_one.jpg", rating: 4.5, stock: 80 }
  ];
  renderHomeGrid();
  setupEventBindings();
  navigate('home');
}

// ==========================================
// 2. Routing System (SPA)
// ==========================================

function navigate(screenId, params = {}) {
  // Hide all screens
  const screens = document.querySelectorAll('.spa-screen');
  screens.forEach(s => s.classList.remove('active'));

  // Show active screen
  const activeScreen = document.getElementById(`screen-${screenId}`);
  if (activeScreen) {
    activeScreen.classList.add('active');
  }

  state.activeRoute = screenId;
  window.scrollTo(0, 0);

  // Trigger Analytics SPA page view event
  const routeMeta = ROUTE_MAP[screenId] || { path: `/${screenId}`, title: 'Amazon' };
  let virtualPath = routeMeta.path;
  let title = routeMeta.title;

  if (screenId === 'product-detail' && params.productId) {
    virtualPath = `/product/${params.productId}`;
    const p = state.products.find(x => x.id === params.productId);
    title = p ? `Amazon.in: ${p.name}` : 'Product Details';
  } else if (screenId === 'search' && params.q) {
    virtualPath = `/search?q=${encodeURIComponent(params.q)}`;
    title = `Search results for "${params.q}"`;
  } else if (screenId === 'checkout') {
    virtualPath = `/checkout/step${state.activeCheckoutStep}`;
    title = `Secure Checkout - Step ${state.activeCheckoutStep}`;
  }

  // Fire tracking
  trackPageView(virtualPath, title);
}

// ==========================================
// 3. UI Redirection & Event Bindings
// ==========================================

function setupEventBindings() {
  // Brand Header Logo Click
  document.getElementById('nav-logo-btn').addEventListener('click', (e) => {
    trackButtonClick('Header Navbar', 'Home Logo Click');
    navigate('home');
  });

  // Delivery Location selector Click
  document.getElementById('nav-address-btn').addEventListener('click', () => {
    trackButtonClick('Header Navbar', 'Address Selection Modal');
    const newLoc = prompt("Enter delivery postal ZIP code or Country:", "India");
    if (newLoc && newLoc.trim() !== "") {
      document.getElementById('active-location').textContent = newLoc.trim();
    }
  });

  // Hero section click shortcut
  document.getElementById('change-loc-hero').addEventListener('click', (e) => {
    e.preventDefault();
    trackButtonClick('Hero Banner', 'Country Redirection Link');
    document.getElementById('active-location').textContent = "India";
  });

  // Search input actions
  const triggerSearch = () => {
    const query = document.getElementById('main-search-input').value;
    const category = document.getElementById('search-category-select').value;
    
    if (query.trim() === '') return;
    
    trackSearch(query);
    
    // Perform filtering
    const results = state.products.filter(p => {
      const matchQuery = p.name.toLowerCase().includes(query.toLowerCase()) || 
                         p.category.toLowerCase().includes(query.toLowerCase()) ||
                         p.brand.toLowerCase().includes(query.toLowerCase());
      const matchCategory = category === 'All' || p.category === category;
      return matchQuery && matchCategory;
    });

    renderSearchResults(results, query);
    navigate('search', { q: query });
  };

  document.getElementById('main-search-btn').addEventListener('click', () => {
    trackButtonClick('Header Navbar', 'Search Icon Click');
    triggerSearch();
  });
  
  document.getElementById('main-search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      trackButtonClick('Header Navbar', 'Search Enter Press');
      triggerSearch();
    }
  });

  // Cart Button Click
  document.getElementById('nav-cart-btn').addEventListener('click', () => {
    trackButtonClick('Header Navbar', 'Cart Button Click');
    renderCart();
    navigate('cart');
    trackViewCart(state.cart);
  });

  // Sign In / Profile header buttons
  document.getElementById('nav-signin-btn').addEventListener('click', () => {
    trackButtonClick('Header Navbar', 'Profile Signin Shortcut');
    if (state.user) {
      // Mock logout
      if (confirm(`Do you want to log out, ${state.user.name}?`)) {
        state.user = null;
        localStorage.removeItem('amazon_clone_user');
        updateUserHeader();
        navigate('home');
      }
    } else {
      navigate('login');
    }
  });

  // Returns and Orders Link
  document.getElementById('nav-orders-btn').addEventListener('click', () => {
    trackButtonClick('Header Navbar', 'Returns & Orders click');
    if (state.lastOrder) {
      navigate('confirmation');
    } else {
      alert("No active orders found in this session.");
    }
  });

  // Bottom scroll shortcut
  document.getElementById('back-to-top-btn').addEventListener('click', () => {
    trackButtonClick('Footer Actions', 'Back To Top Link');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Sub navbar links click handlers
  const navLinks = document.querySelectorAll('.panel-nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const cat = e.target.getAttribute('data-category');
      trackButtonClick('Sub-Navbar Menu Options', cat);
      if (cat === 'All') {
        renderHomeGrid();
        navigate('home');
      } else {
        const filtered = state.products.filter(p => p.category === cat);
        renderSearchResults(filtered, cat);
        navigate('search', { q: cat });
      }
    });
  });

  // Step 1 Shipping Form Action
  document.getElementById('shipping-form').addEventListener('submit', (e) => {
    e.preventDefault();
    state.checkoutDetails.shippingAddress = {
      name: document.getElementById('ship-name').value,
      address: document.getElementById('ship-address').value,
      city: document.getElementById('ship-city').value,
      state: document.getElementById('ship-state').value,
      zip: document.getElementById('ship-zip').value
    };

    trackShippingInfo(state.cart, "Standard Home Delivery");
    
    state.activeCheckoutStep = 2;
    updateCheckoutFunnelUI();
  });

  // Payment radio option change trigger
  const radios = document.getElementsByName('payment-method-radio');
  radios.forEach(r => {
    r.addEventListener('change', (e) => {
      const val = e.target.value;
      state.checkoutDetails.paymentMethod = val;
      if (val === 'UPI') {
        document.getElementById('upi-details-field').style.display = 'flex';
        document.getElementById('card-details-field').style.display = 'none';
        document.getElementById('pay-upi-id').setAttribute('required', 'true');
        document.getElementById('pay-card-num').removeAttribute('required');
      } else {
        document.getElementById('upi-details-field').style.display = 'none';
        document.getElementById('card-details-field').style.display = 'flex';
        document.getElementById('pay-upi-id').removeAttribute('required');
        document.getElementById('pay-card-num').setAttribute('required', 'true');
      }
    });
  });

  // Step 2 Payment Form Action
  document.getElementById('payment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.checkoutDetails.paymentMethod === 'UPI') {
      state.checkoutDetails.upiId = document.getElementById('pay-upi-id').value;
    } else {
      state.checkoutDetails.cardNum = document.getElementById('pay-card-num').value;
      state.checkoutDetails.cardExpiry = document.getElementById('pay-card-expiry').value;
      state.checkoutDetails.cardCvv = document.getElementById('pay-card-cvv').value;
    }

    trackPaymentInfo(state.cart, state.checkoutDetails.paymentMethod);

    state.activeCheckoutStep = 3;
    updateCheckoutFunnelUI();
    renderOrderReview();
  });

  // Submit Order button on review page
  document.getElementById('place-order-btn').addEventListener('click', () => {
    submitCheckoutOrder();
  });

  // Confirmation page exit click
  document.getElementById('conf-home-btn').addEventListener('click', () => {
    trackButtonClick('Confirmation page', 'Return Shopping Button');
    navigate('home');
  });

  // AUTH SWITCH BUTTONS
  document.getElementById('go-to-signup-btn').addEventListener('click', () => {
    trackButtonClick('Login Panel', 'Redirect Signup');
    navigate('signup');
  });

  document.getElementById('go-to-login-btn').addEventListener('click', () => {
    trackButtonClick('Signup Panel', 'Redirect Login');
    navigate('login');
  });

  // Login Form Submission
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const name = email.split('@')[0]; // Simulating username extraction
    state.user = { name, email };
    
    localStorage.setItem('amazon_clone_user', JSON.stringify(state.user));
    updateUserHeader();
    trackLogin('Mock Credentials');
    navigate('home');
  });

  // Signup Form Submission
  document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    state.user = { name, email };

    localStorage.setItem('amazon_clone_user', JSON.stringify(state.user));
    updateUserHeader();
    trackSignup('Mock Registration');
    navigate('home');
  });

  // CLEAR DEBUG CONSOLE EVENT LOGS
  document.getElementById('clear-debug-logs').addEventListener('click', (e) => {
    e.stopPropagation();
    const logBody = document.getElementById('debug-logs-container');
    logBody.innerHTML = '<div class="debug-log-empty">No events captured yet. Perform actions to see dataLayer pushes.</div>';
    document.getElementById('debug-event-count').textContent = '0';
  });

  // MINIMIZE / MAXIMIZE DEBUG CONSOLE PANEL
  document.getElementById('toggle-debug-panel').addEventListener('click', (e) => {
    e.stopPropagation();
    const panel = document.getElementById('analytics-debug-panel');
    const icon = document.querySelector('#toggle-debug-panel i');
    
    if (panel.classList.contains('minimized')) {
      panel.classList.remove('minimized');
      icon.className = 'fa-solid fa-chevron-down';
    } else {
      panel.classList.add('minimized');
      icon.className = 'fa-solid fa-chevron-up';
    }
  });

  // Global listener for raw GTM debug overlays
  window.addEventListener('analytics_event_fired', (e) => {
    appendDebugLog(e.detail);
  });
}

// ==========================================
// 4. Products Rendering (Home & Search)
// ==========================================

function renderHomeGrid() {
  const grid = document.getElementById('home-products-grid');
  if (!grid) return;
  grid.innerHTML = '';

  state.products.forEach((product, idx) => {
    const box = document.createElement('div');
    box.className = 'box';
    box.innerHTML = `
      <div class="box-content">
        <h2>${product.name}</h2>
        <div class="box-img-container">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="box-details">
          <div class="box-price-row">
            <span class="box-brand">${product.brand}</span>
            <span class="box-price">₹${product.price}</span>
          </div>
          <div class="box-rating">
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star-half-stroke"></i>
            <span>${product.rating}</span>
          </div>
          <p class="see-more-link" data-id="${product.id}" data-index="${idx + 1}">See details</p>
        </div>
      </div>
    `;

    // See Details Selector Hook
    box.querySelector('.see-more-link').addEventListener('click', (e) => {
      const pId = e.target.getAttribute('data-id');
      const index = parseInt(e.target.getAttribute('data-index'));
      selectProduct(pId, index);
    });

    grid.appendChild(box);
  });

  // Track initial item list view event
  trackViewItemList(state.products, 'homepage_grid', 'Homepage Featured items');
}

function renderSearchResults(results, query) {
  const grid = document.getElementById('search-products-grid');
  const countSpan = document.getElementById('search-results-count');
  const titleText = document.getElementById('search-title-text');

  if (!grid) return;
  
  grid.innerHTML = '';
  titleText.textContent = `Results for "${query}"`;
  countSpan.textContent = `${results.length} items found`;

  if (results.length === 0) {
    grid.innerHTML = `<div class="loading-spinner" style="grid-column:1/-1;">No products match your search.</div>`;
    return;
  }

  results.forEach((product, idx) => {
    const card = document.createElement('div');
    card.className = 'box';
    card.innerHTML = `
      <div class="box-content">
        <h2>${product.name}</h2>
        <div class="box-img-container">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="box-details">
          <div class="box-price-row">
            <span class="box-brand">${product.brand}</span>
            <span class="box-price">₹${product.price}</span>
          </div>
          <div class="box-rating">
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star-half-stroke"></i>
            <span>${product.rating}</span>
          </div>
          <p class="see-more-link" data-id="${product.id}" data-index="${idx + 1}">See details</p>
        </div>
      </div>
    `;

    card.querySelector('.see-more-link').addEventListener('click', (e) => {
      const pId = e.target.getAttribute('data-id');
      const index = parseInt(e.target.getAttribute('data-index'));
      selectProduct(pId, index, 'search_results', `Search Results: ${query}`);
    });

    grid.appendChild(card);
  });

  // Track Search List views
  trackViewItemList(results, 'search_results', `Search Results: ${query}`);
}

function selectProduct(productId, index, listId = 'homepage_grid', listName = 'Homepage Featured') {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  // 1. Fire select_item event
  trackSelectItem(product, index, listId, listName);

  // 2. Render details page
  renderProductDetail(product);

  // 3. Navigate
  navigate('product-detail', { productId });

  // 4. Fire view_item page event
  trackViewItem(product);
}

function renderProductDetail(product) {
  const container = document.getElementById('product-detail-view');
  if (!container) return;

  container.innerHTML = `
    <div class="detail-left">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="detail-center">
      <h2 class="detail-title">${product.name}</h2>
      <a href="#" class="detail-brand-link">Brand: ${product.brand}</a>
      <div class="detail-ratings">
        <div class="stars">
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star-half-stroke"></i>
        </div>
        <span class="ratings-count">${product.rating} rating</span>
      </div>
      <hr class="divider">
      <div class="detail-price">
        <span class="price-subtext">M.R.P.:</span> ₹${product.price}
      </div>
      <div class="detail-desc">
        <h4>About this item</h4>
        <p>Experience standard high performance with the premium ${product.name}. Designed to enhance daily workflows and lifestyle quality with leading ${product.brand} quality standards.</p>
      </div>
    </div>
    <div class="detail-right">
      <div class="price">₹${product.price}</div>
      <div class="delivery">FREE delivery: <strong>Wednesday, Aug 26</strong></div>
      <div class="stock-status in-stock">In Stock</div>
      
      <div class="qty-select-wrapper">
        <label for="detail-qty-select">Qty:</label>
        <select class="qty-select" id="detail-qty-select">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </div>
      <button class="primary-btn btn-full" id="add-to-cart-detail-btn">Add to Cart</button>
      <button class="secondary-btn btn-full mt-10" id="buy-now-detail-btn">Buy Now</button>
    </div>
  `;

  // Add to Cart Detail Action
  document.getElementById('add-to-cart-detail-btn').addEventListener('click', () => {
    const qty = parseInt(document.getElementById('detail-qty-select').value);
    addToCart(product, qty);
  });

  // Buy Now Action (Add and redirect straight to checkout)
  document.getElementById('buy-now-detail-btn').addEventListener('click', () => {
    const qty = parseInt(document.getElementById('detail-qty-select').value);
    addToCart(product, qty, false);
    renderCart();
    navigate('cart');
    trackViewCart(state.cart);
  });
}

// ==========================================
// 5. Cart Logic
// ==========================================

function addToCart(product, quantity = 1, alertUser = true) {
  // Check if item already exists in cart
  const existingItem = state.cart.find(item => item.productId === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    state.cart.push({
      productId: product.id,
      name: product.name,
      category: product.category,
      brand: product.brand,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
  }

  // Persist State
  localStorage.setItem('amazon_clone_cart', JSON.stringify(state.cart));
  updateCartBadge();

  // Track add_to_cart event
  trackAddToCart(product, quantity);

  if (alertUser) {
    alert(`Added ${quantity} x ${product.name} to your cart.`);
  }
}

function removeFromCart(productId) {
  const itemIndex = state.cart.findIndex(item => item.productId === productId);
  if (itemIndex === -1) return;

  const item = state.cart[itemIndex];
  state.cart.splice(itemIndex, 1);

  // Persist state
  localStorage.setItem('amazon_clone_cart', JSON.stringify(state.cart));
  updateCartBadge();

  // Track remove_from_cart event
  trackRemoveFromCart(item, item.quantity);

  // Re-render
  renderCart();
}

function updateCartQty(productId, newQty) {
  const item = state.cart.find(item => item.productId === productId);
  if (!item) return;

  const diff = newQty - item.quantity;
  if (diff === 0) return;

  if (diff > 0) {
    // Accidentally added
    item.quantity = newQty;
    trackAddToCart(item, diff);
  } else {
    // Accidentally removed
    item.quantity = newQty;
    trackRemoveFromCart(item, Math.abs(diff));
  }

  // Persist state
  localStorage.setItem('amazon_clone_cart', JSON.stringify(state.cart));
  updateCartBadge();
  renderCart();
}

function updateCartBadge() {
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-count-badge');
  if (badge) badge.textContent = count;
}

function renderCart() {
  const container = document.getElementById('cart-items-list');
  const summaryCount = document.getElementById('cart-summary-count');
  const summarySubtotal = document.getElementById('cart-summary-subtotal');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  if (!container) return;

  container.innerHTML = '';
  const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  summaryCount.textContent = totalCount;
  summarySubtotal.textContent = subtotal.toFixed(2);

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-message">
        <i class="fa-solid fa-cart-flatbed"></i>
        <h3>Your Amazon Cart is empty.</h3>
        <p>Browse products and add them to your cart to begin shopping.</p>
      </div>
    `;
    checkoutBtn.style.disabled = true;
    checkoutBtn.style.opacity = '0.5';
    checkoutBtn.onclick = null;
    return;
  }

  checkoutBtn.style.disabled = false;
  checkoutBtn.style.opacity = '1';
  checkoutBtn.onclick = () => {
    trackButtonClick('Cart Panel', 'Proceed Checkout Trigger');
    state.activeCheckoutStep = 1;
    updateCheckoutFunnelUI();
    navigate('checkout');
    trackBeginCheckout(state.cart);
  };

  state.cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item-card';
    row.innerHTML = `
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <h4 class="cart-item-title" data-id="${item.productId}">${item.name}</h4>
        <span class="cart-item-brand">Brand: ${item.brand} | Category: ${item.category}</span>
        <span class="cart-item-stock">In Stock</span>
        <div class="cart-item-actions">
          <div class="qty-select-wrapper" style="margin-bottom:0;">
            <label>Qty:</label>
            <select class="qty-select cart-qty-drop" data-id="${item.productId}">
              ${[1,2,3,4,5,6,7,8,9,10].map(n => `<option value="${n}" ${item.quantity === n ? 'selected' : ''}>${n}</option>`).join('')}
            </select>
          </div>
          <button class="cart-item-delete" data-id="${item.productId}">Delete</button>
        </div>
      </div>
      <div class="cart-item-price-side">
        <span class="cart-item-price">₹${item.price * item.quantity}</span>
        <div style="font-size:0.75rem; color:#666;">₹${item.price} each</div>
      </div>
    `;

    // Binding click selectors
    row.querySelector('.cart-item-title').addEventListener('click', () => {
      const idx = state.products.findIndex(x => x.id === item.productId);
      selectProduct(item.productId, idx !== -1 ? idx + 1 : 1);
    });

    row.querySelector('.cart-item-delete').addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      removeFromCart(id);
    });

    row.querySelector('.cart-qty-drop').addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      const val = parseInt(e.target.value);
      updateCartQty(id, val);
    });

    container.appendChild(row);
  });
}

// ==========================================
// 6. Checkout Process
// ==========================================

function updateCheckoutFunnelUI() {
  // Toggle forms panels
  const panels = document.querySelectorAll('.checkout-step-panel');
  panels.forEach(p => p.classList.remove('active'));

  const activePanel = document.getElementById(`step-${getStepId(state.activeCheckoutStep)}`);
  if (activePanel) {
    activePanel.classList.add('active');
  }

  // Update headers labels
  document.getElementById('checkout-step-number').textContent = state.activeCheckoutStep;
  document.getElementById('checkout-progress-fill').style.width = `${state.activeCheckoutStep * 33.3}%`;

  // Reset side bar totals layout
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 4999 ? 0 : 150;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  document.getElementById('summary-subtotal').textContent = subtotal.toFixed(2);
  document.getElementById('summary-shipping').textContent = shipping.toFixed(2);
  document.getElementById('summary-tax').textContent = tax.toFixed(2);
  document.getElementById('summary-total').textContent = total.toFixed(2);

  // Hide or show final Place Order action button
  const orderBtn = document.getElementById('place-order-btn');
  if (state.activeCheckoutStep === 3) {
    orderBtn.style.display = 'block';
  } else {
    orderBtn.style.display = 'none';
  }

  // Fire SPA navigation tracking internally to record progression
  const routeMeta = ROUTE_MAP['checkout'];
  trackPageView(`${routeMeta.path}/step${state.activeCheckoutStep}`, `Secure Checkout - Step ${state.activeCheckoutStep}`);
}

function getStepId(stepNum) {
  if (stepNum === 1) return 'shipping';
  if (stepNum === 2) return 'payment';
  return 'review';
}

function renderOrderReview() {
  const container = document.getElementById('review-items-container');
  const shipText = document.getElementById('review-shipping-address');
  const payText = document.getElementById('review-payment-method');

  if (!container) return;
  container.innerHTML = '';

  const address = state.checkoutDetails.shippingAddress;
  shipText.textContent = `${address.name}, ${address.address}, ${address.city}, ${address.state} - ${address.zip}`;

  const method = state.checkoutDetails.paymentMethod;
  payText.textContent = method === 'UPI' ? `UPI ID: ${state.checkoutDetails.upiId}` : `Card Ending In: ${state.checkoutDetails.cardNum.slice(-4)}`;

  state.cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'review-item-row';
    row.innerHTML = `
      <span class="review-item-title">${item.name} <span class="review-item-qty">Qty: ${item.quantity}</span></span>
      <span class="review-item-price">₹${item.price * item.quantity}</span>
    `;
    container.appendChild(row);
  });
}

// Order Submission endpoint integrations
async function submitCheckoutOrder() {
  trackButtonClick('Checkout Panel', 'Submit Order Click');
  
  const payload = {
    items: state.cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    })),
    shippingAddress: state.checkoutDetails.shippingAddress,
    paymentMethod: state.checkoutDetails.paymentMethod
  };

  try {
    // Send order compilation request to backend validation server
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      alert(`Checkout failed: ${err.error || 'Server rejected request'}`);
      return;
    }

    const orderResult = await res.json();
    state.lastOrder = orderResult;

    // Trigger purchase protection check
    registerAndFirePurchase(orderResult);

    // Empty Cart
    state.cart = [];
    localStorage.removeItem('amazon_clone_cart');
    updateCartBadge();

    // Render Success confirmation screen
    renderConfirmationDetails(orderResult);
    navigate('confirmation');

  } catch (error) {
    console.error("[Amazon App] Backend order submission failed:", error);
    // Offline simulation mode
    simulateOfflineOrderPlacement();
  }
}

// Simulate offline purchase details
function simulateOfflineOrderPlacement() {
  console.warn("[Amazon App] Simulating purchase transaction offline.");
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal >= 4999 ? 0 : 150;
  const total = subtotal + tax + shipping;

  const mockOrder = {
    orderId: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    items: state.cart.map(item => ({
      item_id: item.productId,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
      quantity: item.quantity
    })),
    subtotal,
    tax,
    shipping,
    total,
    currency: "INR",
    createdAt: new Date().toISOString()
  };

  state.lastOrder = mockOrder;
  registerAndFirePurchase(mockOrder);
  
  state.cart = [];
  localStorage.removeItem('amazon_clone_cart');
  updateCartBadge();
  
  renderConfirmationDetails(mockOrder);
  navigate('confirmation');
}

// ==========================================
// 7. Purchase Duplication Protection
// ==========================================

function registerAndFirePurchase(order) {
  try {
    const txId = order.orderId;
    
    // Load previously fired transactions list from cache
    let firedTxns = [];
    const cached = localStorage.getItem('processed_transactions');
    if (cached) {
      firedTxns = JSON.parse(cached);
    }

    // Skip tracking if already fired
    if (firedTxns.includes(txId)) {
      if (state.config.analyticsDebug) {
        console.warn(`[Analytics Debug] Purchase event for Transaction ID ${txId} was already sent. Blocking duplicate event.`);
      }
      return;
    }

    // Add ID to cache list
    firedTxns.push(txId);
    localStorage.setItem('processed_transactions', JSON.stringify(firedTxns));

    // Execute standard GA4 Purchase payload
    trackPurchase(order);

  } catch (error) {
    console.error("[Analytics] Error in purchase duplication protection:", error);
    // Safe fallback: trigger purchase anyway if storage is blocked
    trackPurchase(order);
  }
}

function renderConfirmationDetails(order) {
  document.getElementById('conf-order-id').textContent = order.orderId;
  document.getElementById('conf-total').textContent = order.total.toFixed(2);
  
  const estDate = new Date();
  estDate.setDate(estDate.getDate() + 4);
  document.getElementById('conf-delivery-date').textContent = estDate.toDateString();
}

// ==========================================
// 8. Auth State Utilities
// ==========================================

function updateUserHeader() {
  const greetSpan = document.getElementById('user-greeting-span');
  const actionLabel = document.getElementById('user-action-label');

  if (state.user) {
    greetSpan.textContent = `Hello, ${state.user.name}`;
    actionLabel.textContent = 'Sign Out';
  } else {
    greetSpan.textContent = 'Hello, Sign in';
    actionLabel.textContent = 'Account & Lists';
  }
}

// ==========================================
// 9. Debug Panel Log Injector
// ==========================================

function appendDebugLog(payload) {
  const container = document.getElementById('debug-logs-container');
  if (!container) return;

  // Remove placeholder if present
  const placeholder = container.querySelector('.debug-log-empty');
  if (placeholder) {
    container.removeChild(placeholder);
  }

  // Increment counter
  const counter = document.getElementById('debug-event-count');
  let currentCount = parseInt(counter.textContent) || 0;
  currentCount++;
  counter.textContent = currentCount;

  // Create log card
  const row = document.createElement('div');
  row.className = 'debug-event-row';
  
  const timeString = new Date().toLocaleTimeString();
  const eventName = payload.event || 'page_view';
  
  row.innerHTML = `
    <div class="debug-event-title-bar">
      <span class="debug-event-name"><i class="fa-solid fa-code"></i> ${eventName}</span>
      <span class="debug-event-time">${timeString} <i class="fa-solid fa-chevron-down ml-5"></i></span>
    </div>
    <pre class="debug-event-payload">${JSON.stringify(payload, null, 2)}</pre>
  `;

  // Bind toggle click
  row.querySelector('.debug-event-title-bar').addEventListener('click', () => {
    row.classList.toggle('expanded');
    const chevron = row.querySelector('.debug-event-time i');
    if (row.classList.contains('expanded')) {
      chevron.className = 'fa-solid fa-chevron-up ml-5';
    } else {
      chevron.className = 'fa-solid fa-chevron-down ml-5';
    }
  });

  container.appendChild(row);
  // Auto-scroll to latest
  container.scrollTop = container.scrollHeight;
}
