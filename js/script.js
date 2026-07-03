/* ==========================================================
   Bazaar — Shopping Website Demo
   Vanilla JS: catalog rendering, filters, cart, persistence
   ========================================================== */

// ---------- Category accent + icon system ----------
const CATEGORY_STYLE = {
  "Electronics": { color: "#0F6E5F", icon: "headphones" },
  "Fashion": { color: "#FF5A1F", icon: "shirt" },
  "Home & Living": { color: "#E8A33D", icon: "home" },
  "Beauty": { color: "#0F6E5F", icon: "sparkle" },
  "Sports": { color: "#FF5A1F", icon: "dumbbell" },
  "Grocery": { color: "#E8A33D", icon: "basket" }
};

const ICONS = {
  headphones: '<path d="M4 14v-2a8 8 0 0 1 16 0v2" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"/><rect x="2.5" y="14" width="5" height="7" rx="2" fill="white"/><rect x="16.5" y="14" width="5" height="7" rx="2" fill="white"/>',
  shirt: '<path d="M8 3 L4 6 L2 9 L5 11 L7 9.5 V21 H17 V9.5 L19 11 L22 9 L20 6 L16 3 C16 5 14 6.5 12 6.5 C10 6.5 8 5 8 3 Z" fill="white"/>',
  home: '<path d="M3 11 L12 3 L21 11 V21 H14 V14 H10 V21 H3 Z" fill="white"/>',
  sparkle: '<path d="M12 2 L14 9 L21 11 L14 13 L12 20 L10 13 L3 11 L10 9 Z" fill="white"/>',
  dumbbell: '<path d="M3 9 H5 V15 H3 Z" fill="white"/><path d="M19 9 H21 V15 H19 Z" fill="white"/><rect x="5" y="7" width="3" height="10" rx="1" fill="white"/><rect x="16" y="7" width="3" height="10" rx="1" fill="white"/><rect x="8" y="11" width="8" height="2" fill="white"/>',
  basket: '<path d="M4 9 H20 L18.5 20 H5.5 Z" fill="white"/><path d="M8 9 L9.5 4 M16 9 L14.5 4 M12 9 V4" stroke="white" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
};

function iconMarkup(name){
  return `<svg viewBox="0 0 24 24">${ICONS[name] || ICONS.basket}</svg>`;
}

// ---------- Product catalog ----------
const PRODUCTS = [
  { id: 1,  name: "Wireless Bluetooth Earbuds",        category: "Electronics",  price: 3499, was: 4999, rating: 4.5, badge: "Best Seller" },
  { id: 2,  name: "Smart LED Desk Lamp",                category: "Home & Living",price: 1899, was: 2500, rating: 4.2, badge: null },
  { id: 3,  name: "Men's Cotton Polo Shirt",            category: "Fashion",      price: 1299, was: 1799, rating: 4.0, badge: null },
  { id: 4,  name: "Women's Printed Lawn Suit",          category: "Fashion",      price: 2199, was: 2999, rating: 4.6, badge: "New" },
  { id: 5,  name: "Non-Stick Cooking Pan Set",          category: "Home & Living",price: 3299, was: 4200, rating: 4.3, badge: null },
  { id: 6,  name: "Herbal Face Wash 100ml",             category: "Beauty",       price: 549,  was: 700,  rating: 4.1, badge: null },
  { id: 7,  name: "Matte Lipstick Combo (3pc)",         category: "Beauty",       price: 899,  was: 1200, rating: 4.4, badge: null },
  { id: 8,  name: "Yoga Mat with Carry Strap",          category: "Sports",       price: 1499, was: 1999, rating: 4.5, badge: null },
  { id: 9,  name: "Adjustable Dumbbell Set 10kg",       category: "Sports",       price: 4999, was: 6500, rating: 4.7, badge: "Deal" },
  { id: 10, name: "Organic Basmati Rice 5kg",           category: "Grocery",      price: 1650, was: null, rating: 4.8, badge: null },
  { id: 11, name: "Assorted Dry Fruits Box 1kg",        category: "Grocery",      price: 1999, was: 2400, rating: 4.6, badge: null },
  { id: 12, name: "Smartwatch Fitness Tracker",         category: "Electronics",  price: 5999, was: 7999, rating: 4.3, badge: "Best Seller" },
  { id: 13, name: "Portable Bluetooth Speaker",         category: "Electronics", price: 2799, was: 3500, rating: 4.4, badge: null },
  { id: 14, name: "Kids Analog Wall Clock",             category: "Home & Living",price: 999,  was: null, rating: 4.0, badge: null },
  { id: 15, name: "Unisex Sports Sneakers",             category: "Fashion",      price: 3799, was: 4999, rating: 4.5, badge: "New" },
  { id: 16, name: "Green Tea Bags (Box of 25)",         category: "Grocery",      price: 599,  was: null, rating: 4.2, badge: null }
];

const CATEGORIES = ["All", ...Object.keys(CATEGORY_STYLE)];

// ---------- State ----------
let state = {
  category: "All",
  search: "",
  sort: "popular",
  liked: new Set(),
  cart: JSON.parse(localStorage.getItem("bazaar_cart") || "{}") // { productId: qty }
};

const FREE_SHIPPING_THRESHOLD = 2500;
const SHIPPING_FEE = 150;

function fmt(n){
  return "Rs. " + Number(n).toLocaleString("en-US");
}

// ---------- Rendering: category pills ----------
function renderCategoryPills(){
  const wrap = document.getElementById("categoryPills");
  wrap.innerHTML = CATEGORIES.map(cat => `
    <button class="cat-pill ${cat === state.category ? "active" : ""}" data-cat="${cat}">${cat}</button>
  `).join("");

  wrap.querySelectorAll(".cat-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      state.category = btn.dataset.cat;
      renderCategoryPills();
      renderProducts();
    });
  });
}

// ---------- Rendering: product grid ----------
function getFilteredProducts(){
  let list = PRODUCTS.filter(p => {
    const matchesCategory = state.category === "All" || p.category === state.category;
    const matchesSearch = p.name.toLowerCase().includes(state.search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  switch (state.sort) {
    case "price-asc": list.sort((a, b) => a.price - b.price); break;
    case "price-desc": list.sort((a, b) => b.price - a.price); break;
    case "rating": list.sort((a, b) => b.rating - a.rating); break;
    default: break; // popular = catalog order
  }
  return list;
}

function renderProducts(){
  const grid = document.getElementById("productGrid");
  const empty = document.getElementById("emptyState");
  const list = getFilteredProducts();

  document.getElementById("resultsCount").textContent =
    `${list.length} product${list.length !== 1 ? "s" : ""}${state.category !== "All" ? " in " + state.category : ""}`;

  if (list.length === 0){
    grid.innerHTML = "";
    empty.classList.remove("d-none");
    return;
  }
  empty.classList.add("d-none");

  grid.innerHTML = list.map(p => {
    const style = CATEGORY_STYLE[p.category];
    const discount = p.was ? Math.round(100 - (p.price / p.was) * 100) : null;
    const liked = state.liked.has(p.id);
    return `
      <div class="product-card">
        <div class="product-tile" style="background:${style.color}">
          ${discount ? `<span class="discount-badge">-${discount}%</span>` : ""}
          <button class="wishlist-btn ${liked ? "liked" : ""}" data-like="${p.id}" aria-label="Save to wishlist">
            <svg viewBox="0 0 24 24" stroke-width="2"><path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1.2 4.5 2.7C12 6.2 13.5 5 15.5 5 19 5 21.5 8.5 19.5 12.5 17 16.65 12 21 12 21Z"/></svg>
          </button>
          ${iconMarkup(style.icon)}
          ${p.badge ? `<span class="status-badge">${p.badge}</span>` : ""}
        </div>
        <div class="product-body">
          <span class="product-cat">${p.category}</span>
          <span class="product-name">${p.name}</span>
          <span class="product-rating">
            <svg viewBox="0 0 24 24"><path d="M12 2 L14.9 8.6 L22 9.3 L16.7 14 L18.2 21 L12 17.3 L5.8 21 L7.3 14 L2 9.3 L9.1 8.6 Z"/></svg>
            ${p.rating.toFixed(1)}
          </span>
          <div class="price-row">
            <span class="price-now">${fmt(p.price)}</span>
            ${p.was ? `<span class="price-was">${fmt(p.was)}</span>` : ""}
          </div>
          <button class="add-btn" data-add="${p.id}">Add to Cart</button>
        </div>
      </div>
    `;
  }).join("");

  grid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(Number(btn.dataset.add));
      btn.textContent = "Added ✓";
      btn.classList.add("added");
      setTimeout(() => { btn.textContent = "Add to Cart"; btn.classList.remove("added"); }, 1000);
    });
  });

  grid.querySelectorAll("[data-like]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.like);
      if (state.liked.has(id)) state.liked.delete(id); else state.liked.add(id);
      renderProducts();
    });
  });
}

// ---------- Cart logic ----------
function saveCart(){
  localStorage.setItem("bazaar_cart", JSON.stringify(state.cart));
}

function addToCart(id){
  state.cart[id] = (state.cart[id] || 0) + 1;
  saveCart();
  renderCart();
  showToast("Added to cart");
}

function updateQty(id, delta){
  if (!state.cart[id]) return;
  state.cart[id] += delta;
  if (state.cart[id] <= 0) delete state.cart[id];
  saveCart();
  renderCart();
}

function removeFromCart(id){
  delete state.cart[id];
  saveCart();
  renderCart();
}

function renderCart(){
  const ids = Object.keys(state.cart);
  const cartItems = document.getElementById("cartItems");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartFooter = document.getElementById("cartFooter");
  const cartCount = document.getElementById("cartCount");

  const totalQty = ids.reduce((sum, id) => sum + state.cart[id], 0);
  cartCount.textContent = totalQty;

  if (ids.length === 0){
    cartItems.innerHTML = "";
    cartEmpty.classList.remove("d-none");
    cartFooter.classList.add("d-none");
    return;
  }
  cartEmpty.classList.add("d-none");
  cartFooter.classList.remove("d-none");

  let subtotal = 0;
  cartItems.innerHTML = ids.map(id => {
    const p = PRODUCTS.find(prod => prod.id === Number(id));
    const qty = state.cart[id];
    const lineTotal = p.price * qty;
    subtotal += lineTotal;
    const style = CATEGORY_STYLE[p.category];
    return `
      <div class="cart-line">
        <div class="cart-thumb" style="background:${style.color}">${iconMarkup(style.icon)}</div>
        <div class="cart-line-info">
          <div class="cart-line-name">${p.name}</div>
          <div class="cart-line-price">${fmt(p.price)} × ${qty} = ${fmt(lineTotal)}</div>
          <div class="qty-stepper">
            <button data-qty-down="${p.id}" aria-label="Decrease quantity">−</button>
            <span>${qty}</span>
            <button data-qty-up="${p.id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="remove-line" data-remove="${p.id}">Remove</button>
        </div>
      </div>
    `;
  }).join("");

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  document.getElementById("cartSubtotal").textContent = fmt(subtotal);
  document.getElementById("cartShipping").textContent = shipping === 0 ? "Free" : fmt(shipping);
  document.getElementById("cartTotal").textContent = fmt(subtotal + shipping);

  const hint = document.getElementById("shippingHint");
  if (shipping > 0){
    hint.textContent = `Add ${fmt(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.`;
  } else {
    hint.textContent = "You've unlocked free shipping.";
  }

  cartItems.querySelectorAll("[data-qty-up]").forEach(b => b.addEventListener("click", () => updateQty(Number(b.dataset.qtyUp), 1)));
  cartItems.querySelectorAll("[data-qty-down]").forEach(b => b.addEventListener("click", () => updateQty(Number(b.dataset.qtyDown), -1)));
  cartItems.querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", () => removeFromCart(Number(b.dataset.remove))));
}

// ---------- Checkout (demo) ----------
document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (Object.keys(state.cart).length === 0) return;
  state.cart = {};
  saveCart();
  renderCart();
  showToast("Order placed — thanks for shopping! (demo)");
  const offcanvasEl = document.getElementById("cartDrawer");
  const instance = bootstrap.Offcanvas.getInstance(offcanvasEl);
  if (instance) instance.hide();
});

// ---------- Toast ----------
let toastTimer = null;
function showToast(msg){
  const toast = document.getElementById("appToast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ---------- Search + Sort ----------
document.getElementById("searchInput").addEventListener("input", (e) => {
  state.search = e.target.value;
  renderProducts();
});

document.getElementById("sortSelect").addEventListener("change", (e) => {
  state.sort = e.target.value;
  renderProducts();
});

document.getElementById("clearFilters").addEventListener("click", () => {
  state.search = "";
  state.category = "All";
  document.getElementById("searchInput").value = "";
  renderCategoryPills();
  renderProducts();
});

// ---------- Flash sale countdown (to local midnight) ----------
function updateCountdown(){
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  let diff = Math.max(0, midnight - now);

  const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

  document.getElementById("countdown").textContent = `${h}:${m}:${s}`;
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ---------- Init ----------
renderCategoryPills();
renderProducts();
renderCart();
