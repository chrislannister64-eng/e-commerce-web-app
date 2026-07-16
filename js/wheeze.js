import { watchAuth, logOut } from "./firebase.js";

// ── TOAST ─────────────────────────────────────────────
function showToast(message, type = "info") {
  function mount() {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add("show")));
    setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 300); }, 2800);
  }
  document.body ? mount() : document.addEventListener("DOMContentLoaded", mount);
}

// ── PRODUCTS ──────────────────────────────────────────
const products = [
  // Shoes
  { id: 1,  name: "Nike Air Max",        price: 75000,  img: "product-images/nike air max.avif",                      category: "Shoes" },
  { id: 2,  name: "Jordan 1 High",       price: 105000, img: "product-images/Air%20jordan%201.webp",                  category: "Shoes" },
  { id: 3,  name: "Adidas Superstar",    price: 60000,  img: "product-images/Adidas.jpg",                             category: "Shoes" },
  { id: 4,  name: "Adidas Campus",       price: 88500,  img: "product-images/adidas%20campus.jpg",                    category: "Shoes" },
  { id: 5,  name: "New Balance 550",     price: 82500,  img: "product-images/New%20balance.jpg",                      category: "Shoes" },
  { id: 6,  name: "Puma Suede",          price: 54000,  img: "product-images/puma%20strt.jpg",                        category: "Shoes" },
  { id: 7,  name: "Vans Old Skool",      price: 49500,  img: "product-images/vans%20old%20skool.webp",                category: "Shoes" },
  { id: 8,  name: "Converse Chuck 70",   price: 52500,  img: "product-images/Converse.jpg",                           category: "Shoes" },
  { id: 9,  name: "Reebok Club C",       price: 58500,  img: "product-images/reebook.webp",                           category: "Shoes" },
  { id: 10, name: "Nike Dunk Low",       price: 90000,  img: "product-images/nike%20dunk.webp",                       category: "Shoes" },
  { id: 11, name: "Asics Gel-Lyte",      price: 67500,  img: "product-images/Asics%20gel.jpg",                        category: "Shoes" },
  { id: 12, name: "puma-velocity",       price: 72000,  img: "product-images/puma velocity.webp",                     category: "Shoes" },
  { id: 13, name: "Timberland Boots",    price: 120000, img: "product-images/Timberland.webp",                        category: "Shoes" },
  { id: 14, name: "Sketchers",           price: 45000,  img: "product-images/sketchers run.jpg",                      category: "Shoes" },

  // Clothing
  { id: 15, name: "Classic Hoodie",      price: 52500,  img: "product-images/classic-hoodie.webp",      category: "Clothing" },
  { id: 16, name: "Cargo Pants",         price: 67500,  img: "product-images/cargo-pants.webp",         category: "Clothing" },
  { id: 17, name: "Graphic Tee",         price: 33000,  img: "product-images/graphic-tee.webp", category: "Clothing" },
  { id: 18, name: "Varsity Jacket",      price: 133500, img: "product-images/varsity-jacket.webp",      category: "Clothing" },
  { id: 19, name: "Denim Jacket",        price: 90000,  img: "product-images/denim-jacket.avif",        category: "Clothing" },
  { id: 20, name: "Oversized Tee",       price: 27000,  img: "product-images/oversized-tee.avif",       category: "Clothing" },
  { id: 21, name: "Joggers",             price: 45000,  img: "product-images/joggers.webp",             category: "Clothing" },
  { id: 22, name: "Polo Shirt",          price: 37500,  img: "product-images/polo.webp",          category: "Clothing" },
  { id: 23, name: "Bomber Jacket",       price: 112500, img: "product-images/bomber-jacket.webp",       category: "Clothing" },
  { id: 24, name: "Flannel Shirt",       price: 52500,  img: "product-images/flannel.webp",       category: "Clothing" },
  { id: 25, name: "Track Suit",          price: 97500,  img: "product-images/track-suit.webp",          category: "Clothing" },
  { id: 26, name: "Sweatpants",          price: 42000,  img: "product-images/sweat-pants.webp",          category: "Clothing" },
  { id: 27, name: "Trench Coat",         price: 157500, img: "product-images/trench-coat.webp",         category: "Clothing" },
  { id: 28, name: "Slim Fit Jeans",      price: 60000,  img: "product-images/slim-jeans.webp",      category: "Clothing" },

  // Accessories
  { id: 29, name: "Silver Chain",        price: 42000,  img: "product-images/silver-chain.webp",        category: "Accessories" },
  { id: 30, name: "Bucket Hat",          price: 27000,  img: "product-images/bucket hat.webp",              category: "Accessories" },
  { id: 31, name: "Canvas Backpack",     price: 82500,  img: "product-images/pexels-bag-1854148_1920.jpg",            category: "Accessories" },
  { id: 32, name: "Retro Sunglasses",    price: 48000,  img: "product-images/retro-glasses.webp",    category: "Accessories" },
  { id: 33, name: "Snapback Cap",        price: 22500,  img: "product-images/Cap.webp",        category: "Accessories" },
  { id: 34, name: "Leather Belt",        price: 30000,  img: "product-images/leather-belt.webp",        category: "Accessories" },
  { id: 35, name: "Gold Bracelet",       price: 60000,  img: "product-images/gold-bracelet.webp",       category: "Accessories" },
  { id: 36, name: "Crossbody Bag",       price: 67500,  img: "product-images/marlon_delibasic-handbag-2356179_1920.jpg", category: "Accessories" },
  { id: 37, name: "Beanie",              price: 18000,  img: "product-images/a-white-hat-is-laying-on-a-white-surface-free-photo.jpeg", category: "Accessories" },
  { id: 38, name: "Leather Wallet",      price: 37500,  img: "product-images/wallet.webp",              category: "Accessories" },
  { id: 39, name: "Tote Bag",            price: 33000,  img: "product-images/tote bag.webp",            category: "Accessories" },
  { id: 40, name: "Streetwear Cap",      price: 27000,  img: "product-images/strt-cap.webp",            category: "Accessories" },
  { id: 41, name: "Hoop Earrings",       price: 22500,  img: "product-images/hoop-earrings.webp",       category: "Accessories" },
  { id: 42, name: "Durag",               price: 9000,   img: "product-images/Durag.avif",               category: "Accessories" },

  // Electronics
  { id: 43, name: "iPhone 15 Pro",       price: 1498500, img: "product-images/14%20pro%20max.avif",     category: "Electronics" },
  { id: 44, name: "Samsung Galaxy S24",  price: 1273500, img: "product-images/samsung%20s25%20ultra.avif",category: "Electronics" },
  { id: 45, name: "MacBook Air M3",      price: 1948500, img: "product-images/MacBook-air-m3.webp",     category: "Electronics" },
  { id: 46, name: "AirPods Pro",         price: 373500,  img: "product-images/airpod pro.webp",        category: "Electronics" },
  { id: 47, name: "Sony WH-1000XM5",     price: 523500,  img: "product-images/sony-wh1000xm5.webp",     category: "Electronics" },
  { id: 48, name: "iPad Pro",            price: 1648500, img: "product-images/ipad-pro.webp",           category: "Electronics" },
  { id: 49, name: "Apple Watch",         price: 598500,  img: "product-images/apple-watch.webp",        category: "Electronics" },
  { id: 50, name: "Dell XPS 15",         price: 2173500, img: "product-images/dell-xps15.webp",         category: "Electronics" },
  { id: 51, name: "Nintendo Switch",     price: 448500,  img: "product-images/nintendo-switch.webp",    category: "Electronics" },
  { id: 52, name: "PS5",                 price: 948500,  img: "product-images/ps5.avif",                category: "Electronics" },
  { id: 53, name: "JBL Speaker",         price: 148500,  img: "product-images/JBL.webp",                category: "Electronics" },
  { id: 54, name: "Canon Camera",        price: 78500,  img: "product-images/canon-camera.webp",       category: "Electronics" },
  { id: 55, name: "Ring Light",          price: 37500,   img: "product-images/ring-light.webp",         category: "Electronics" },
  { id: 56, name: "Mechanical Keyboard", price: 112500,  img: "product-images/mechanical-keyboard.webp",category: "Electronics" },
];

// ── CART — always start fresh from localStorage ───────
// Clear any stale/test cart data on first load
if (!sessionStorage.getItem("cart_initialized")) {
  localStorage.removeItem("cart");
  sessionStorage.setItem("cart_initialized", "true");
}
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// ── CARD BUILDER ──────────────────────────────────────
function buildCard(p) {
  return `
    <div class="product-card">
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <div class="product-card-body">
        <p class="category">${p.category}</p>
        <h3>${p.name}</h3>
        <p class="price">₦${p.price.toLocaleString()}</p>
        <button class="add-btn" data-id="${p.id}">Add to Cart</button>
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
  productGrid.addEventListener("click", handleAddClick);
}

if (productGrid) renderProducts(currentProducts);

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
  addToCart(parseInt(btn.dataset.id));
  btn.textContent = "Added ✓";
  btn.style.opacity = "0.7";
  setTimeout(() => { btn.textContent = "Add to Cart"; btn.style.opacity = ""; }, 1200);
}

function addToCart(productId) {
  const product  = products.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(i => i.id === productId);
  if (existing) { existing.quantity++; }
  else { cart.push({ ...product, quantity: 1 }); }
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
    container.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p>Your cart is empty</p></div>`;
    if (footer) footer.style.display = "none";
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₦${(item.price * item.quantity).toLocaleString()}</div>
      </div>
      <div class="qty-controls">
        <button data-action="dec" data-id="${item.id}">−</button>
        <span>${item.quantity}</span>
        <button data-action="inc" data-id="${item.id}">+</button>
      </div>
      <button class="remove-btn" data-action="remove" data-id="${item.id}">✕</button>
    </div>`).join("");

  if (footer) footer.style.display = "flex";
  if (totalEl) {
    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    totalEl.textContent = `₦${total.toLocaleString()}`;
  }
}

document.addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  const id     = parseInt(e.target.dataset.id);
  if (!action || isNaN(id)) return;
  if (action === "inc")    { const i = cart.find(i => i.id === id); if (i) i.quantity++; }
  if (action === "dec")    { const i = cart.find(i => i.id === id); if (i) { i.quantity--; if (i.quantity <= 0) cart = cart.filter(c => c.id !== id); } }
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

window.openCart     = () => { document.getElementById("cart-panel")?.classList.add("active"); document.getElementById("cart-overlay")?.classList.add("active"); };
window.closeCart    = () => { document.getElementById("cart-panel")?.classList.remove("active"); document.getElementById("cart-overlay")?.classList.remove("active"); };
window.goToCheckout = () => {
  if (cart.length === 0) { showToast("Your cart is empty.", "error"); return; }

  import("./firebase.js").then(({ auth }) => {
    if (auth.currentUser) {
      location.href = "checkout.html";
    } else {
      showToast("Please login or sign up to checkout.", "info");
      setTimeout(() => location.href = "login.html", 1500);
    }
  });
};

// ── NAV AUTH STATE ────────────────────────────────────
watchAuth((user) => {
  const loginBtn  = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const greeting  = document.getElementById("user-greeting");

  if (user) {
    const username = localStorage.getItem("wheeze_username") || user.email.split("@")[0];
    if (loginBtn)  loginBtn.style.display  = "none";
    if (signupBtn) signupBtn.style.display = "none";
    if (logoutBtn) {
      logoutBtn.style.display = "inline-flex";
      logoutBtn.onclick = async () => {
        await logOut();
        localStorage.removeItem("cart");
        localStorage.removeItem("wheeze_username");
        sessionStorage.removeItem("cart_initialized");
        showToast("Logged out. See you soon!", "info");
        setTimeout(() => location.href = "index.html", 1000);
      };
    }
    if (greeting) greeting.textContent = `Hey, ${username} 👋`;
  } else {
    if (loginBtn)  loginBtn.style.display  = "inline-flex";
    if (signupBtn) signupBtn.style.display = "inline-flex";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (greeting)  greeting.textContent    = "";
  }
});

syncCart();
