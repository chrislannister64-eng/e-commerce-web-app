import { saveOrder, watchAuth } from "./firebase.js";

// ── TOAST (self-contained) ────────────────────────────
function showToast(message, type = "info") {
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
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

let currentUser = null;
watchAuth((user) => { currentUser = user; });

// ── RENDER ORDER SUMMARY ──────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const cart           = JSON.parse(localStorage.getItem("cart") || "[]");
  const itemsContainer = document.getElementById("checkout-items");
  const totalEl        = document.getElementById("checkout-total");

  if (!itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = `<p style="color:var(--ink-2);font-size:14px">
      Your cart is empty. <a href="products.html">Keep shopping →</a></p>`;
    return;
  }

  let total = 0;
  itemsContainer.innerHTML = cart.map(item => {
    // Prices are already in Naira — no conversion needed
    const subtotal = item.price * item.quantity;
    total += subtotal;
    return `
      <div class="checkout-item">
        <h4>${item.name}
          <span style="font-weight:400;color:var(--ink-2)">× ${item.quantity}</span>
        </h4>
        <p>₦${subtotal.toLocaleString()}</p>
      </div>`;
  }).join("");

  if (totalEl) totalEl.textContent = `Total: ₦${total.toLocaleString()}`;

  const payBtn = document.querySelector(".pay-btn");
  if (payBtn) payBtn.addEventListener("click", payNow);
});

// ── PAY WITH PAYSTACK ─────────────────────────────────
function payNow() {
  const name    = document.getElementById("customer-name")?.value.trim();
  const email   = document.getElementById("customer-email")?.value.trim();
  const address = document.getElementById("customer-address")?.value.trim();
  const cart    = JSON.parse(localStorage.getItem("cart") || "[]");

  if (!name || !email || !address) {
    showToast("Please fill in all your details.", "error"); return;
  }
  if (!email.includes("@")) {
    showToast("Please enter a valid email.", "error"); return;
  }
  if (cart.length === 0) {
    showToast("Your cart is empty.", "error"); return;
  }
  if (typeof PaystackPop === "undefined") {
    showToast("Payment system failed to load. Please refresh.", "error"); return;
  }

  // Prices already in Naira, convert to kobo for Paystack
  const total        = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const amountInKobo = Math.round(total * 100);

  const handler = PaystackPop.setup({
    key:      "pk_test_48ba6ccaa99252dd5419e09404b48af0271d74b7",
    email:    email,
    amount:   amountInKobo,
    currency: "NGN",
    ref:      "wheeze_" + Date.now(),
    metadata: {
      custom_fields: [
        { display_name: "Customer Name",    variable_name: "customer_name",    value: name },
        { display_name: "Delivery Address", variable_name: "delivery_address", value: address }
      ]
    },
    callback: function (response) {
      const userId = currentUser ? currentUser.uid : "guest";
      saveOrder(userId, cart, total, { name, email, address })
        .catch(err => console.error("Order save failed:", err))
        .finally(() => {
          localStorage.removeItem("cart");
          showToast("Payment successful! 🎉", "success");
          setTimeout(() => { location.href = "success.html"; }, 1200);
        });
    },
    onClose: function () {
      showToast("Payment window closed.", "info");
    }
  });

  handler.openIframe();
}
