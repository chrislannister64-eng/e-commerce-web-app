import { watchAuth } from "./firebase.js";

// ── PRODUCTS DATA ─────────────────────────────────────
const products = [
  { id: 1,  name: "Nike Air Max",      price: 50,  image: "https://placehold.co/300x300?text=Nike+Air",       category: "Shoes" },
  { id: 2,  name: "Jordan 1 High",     price: 70,  image: "https://placehold.co/300x300?text=Jordan+1",       category: "Shoes" },
  { id: 3,  name: "Adidas Superstar",  price: 40,  image: "https://placehold.co/300x300?text=Adidas",         category: "Shoes" },
  { id: 4,  name: "Adidas Campus",     price: 59,  image: "https://placehold.co/300x300?text=Adidas+Campus",  category: "Shoes" },
  { id: 5,  name: "Classic Hoodie",    price: 35,  image: "https://placehold.co/300x300?text=Hoodie",         category: "Clothing" },
  { id: 6,  name: "Cargo Pants",       price: 45,  image: "https://placehold.co/300x300?text=Cargo+Pants",    category: "Clothing" },
  { id: 7,  name: "Graphic Tee",       price: 22,  image: "https://placehold.co/300x300?text=Graphic+Tee",    category: "Clothing" },
  { id: 8,  name: "Varsity Jacket",    price: 89,  image: "https://placehold.co/300x300?text=Varsity+Jacket", category: "Clothing" },
  { id: 9,  name: "Silver Chain",      price: 28,  image: "https://placehold.co/300x300?text=Chain",          category: "Accessories" },
  { id: 10, name: "Bucket Hat",        price: 18,  image: "https://placehold.co/300x300?text=Bucket+Hat",     category: "Accessories" },
  { id: 11, name: "Canvas Backpack",   price: 55,  image: "https://placehold.co/300x300?text=Backpack",       category: "Accessories" },
  { id: 12, name: "Retro Sunglasses",  price: 32,  image: "https://placehold.co/300x300?text=Sunglasses",     category: "Accessories" },
];

// ── CART STATE ────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// ── CARD BUILDER ──────────────────────────────────────
function buildCard(product) {
  return `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="product-card-body">
        <p class="category">${product.category}</p>
        <h3>${product.name}</h3>
        <p class="price">₦${(product.price * 1500).toLocaleString()}</p>
        <button class="add-btn" data-id="${product.id}">Add to Cart</button>
      </div>
    </div>`;
}

// ── FEATURED (home page) ──────────────────────────────
const featuredContainer = document.getElementById("featured-products-container");
if (featuredContainer) {
  featuredContainer.innerHTML = products.slice(0, 4).map(buildCard).join("");
  featuredContainer.addEventListener("click", handleAddClick);
}

// ── PRODUCTS PAGE ─────────────────────────────────────
const productGrid  = document.getElementById("products-container");
const pageNumberEl = document.getElementById("page-number");
const prevBtn      = document.getElementById("prev-btn");
const nextBtn      = document.getElementById("next-btn");

let currentPage     = 1;
const perPage       = 8;
let currentProducts = [...products];

function renderProducts(list) {
  if (!productGrid) return;
  const start   = (currentPage - 1) * perPage;
  const visible = list.slice(start, start + perPage);
  productGrid.innerHTML = visible.length
    ? visible.map(buildCard).join("")
    : `<p style="padding:40px;text-align:center;color:var(--ink-2)">No products found.</p>`;
  if (pageNumberEl) pageNumberEl.textContent = currentPage;
}

if (productGrid) {
  renderProducts(currentProducts);
  productGrid.addEventListener("click", handleAddClick);
}

if (prevBtn) prevBtn.addEventListener("click", () => {
  if (currentPage > 1) { currentPage--; renderProducts(currentProducts); }
});

if (nextBtn) nextBtn.addEventListener("click", () => {
  const total = Math.ceil(currentProducts.length / perPage);
  if (currentPage < total) { currentPage++; renderProducts(currentProducts); }
});

// ── SEARCH ────────────────────────────────────────────
const searchInput = document.getElementById("search-input");
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase().trim();
    currentProducts = products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
    currentPage = 1;
    renderProducts(currentProducts);
  });
}

// ── CATEGORY FILTER ───────────────────────────────────
window.filterCategory = function (category, btn) {
  document.querySelectorAll(".category-filters button").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  currentPage = 1;
  currentProducts = category === "All" ? [...products] : products.filter(p => p.category === category);
  if (searchInput) searchInput.value = "";
  renderProducts(currentProducts);
};

// ── ADD TO CART ───────────────────────────────────────
function handleAddClick(e) {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;
  const id = parseInt(btn.dataset.id);
  addToCart(id);

  btn.textContent = "Added ✓";
  btn.style.opacity = "0.7";
  setTimeout(() => {
    btn.textContent = "Add to Cart";
    btn.style.opacity = "";
  }, 1200);
}

function addToCart(productId) {
  const product  = products.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  showToast(`${product.name} added to cart`, "success");
  syncCart();
}

// ── CART RENDER ───────────────────────────────────────
function renderCart() {
  const container = document.getElementById("cart-items");
  const footer    = document.getElementById("cart-footer");
  const totalEl   = document.getElementById("cart-total");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Your cart is empty</p>
      </div>`;
    if (footer) footer.style.display = "none";
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₦${(item.price * 1500 * item.quantity).toLocaleString()}</div>
      </div>
      <div class="qty-controls">
        <button data-action="dec" data-id="${item.id}">−</button>
        <span>${item.quantity}</span>
        <button data-action="inc" data-id="${item.id}">+</button>
      </div>
      <button class="remove-btn" data-action="remove" data-id="${item.id}" title="Remove">✕</button>
    </div>
  `).join("");

  if (footer) footer.style.display = "flex";

  if (totalEl) {
    const total = cart.reduce((sum, i) => sum + i.price * 1500 * i.quantity, 0);
    totalEl.textContent = `₦${total.toLocaleString()}`;
  }
}

// Delegated cart controls
document.addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  const id     = parseInt(e.target.dataset.id);
  if (!action || isNaN(id)) return;

  if (action === "inc")    { const item = cart.find(i => i.id === id); if (item) item.quantity++; }
  if (action === "dec")    { const item = cart.find(i => i.id === id); if (item) { item.quantity--; if (item.quantity <= 0) cart = cart.filter(i => i.id !== id); } }
  if (action === "remove") { cart = cart.filter(i => i.id !== id); }

  syncCart();
});

function updateCartCount() {
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
}

function syncCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

// ── CART OPEN/CLOSE ───────────────────────────────────
window.openCart  = () => {
  document.getElementById("cart-panel")?.classList.add("active");
  document.getElementById("cart-overlay")?.classList.add("active");
};
window.closeCart = () => {
  document.getElementById("cart-panel")?.classList.remove("active");
  document.getElementById("cart-overlay")?.classList.remove("active");
};

// ── CHECKOUT REDIRECT ─────────────────────────────────
window.goToCheckout = () => {
  if (cart.length === 0) { showToast("Your cart is empty.", "error"); return; }
  location.href = "checkout.html";
};

// ── NAV AUTH STATE ────────────────────────────────────
watchAuth((user) => {
  const loginBtn  = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const greeting  = document.getElementById("user-greeting");

  if (user) {
    if (loginBtn)  loginBtn.style.display  = "none";
    if (signupBtn) signupBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    if (greeting)  greeting.textContent    = `Hey, ${user.email.split("@")[0]} 👋`;
  } else {
    if (loginBtn)  loginBtn.style.display  = "inline-flex";
    if (signupBtn) signupBtn.style.display = "inline-flex";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (greeting)  greeting.textContent    = "";
  }
});

// Init
syncCart();
