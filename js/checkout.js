import { auth, saveOrder, watchAuth } from "./firebase.js";

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
    const subtotal = item.price * item.quantity;
    total += subtotal;
    return `
      <div class="checkout-item">
        <h4>${item.name}
          <span style="font-weight:400;color:var(--ink-2)">× ${item.quantity}</span>
        </h4>
        <p>$${subtotal.toFixed(2)}</p>
      </div>`;
  }).join("");

  if (totalEl) totalEl.textContent = `Total: $${total.toFixed(2)}`;
});

// ── PAY WITH PAYSTACK ─────────────────────────────────
window.payNow = async function () {
  const name    = document.getElementById("customer-name")?.value.trim();
  const email   = document.getElementById("customer-email")?.value.trim();
  const address = document.getElementById("customer-address")?.value.trim();
  const cart    = JSON.parse(localStorage.getItem("cart") || "[]");

  if (!name || !email || !address) {
    showToast("Please fill in all your details.", "error"); return;
  }
  if (cart.length === 0) {
    showToast("Your cart is empty.", "error"); return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Paystack expects amount in kobo (smallest currency unit)
  // Since products are priced in USD for demo, we'll treat as NGN
  // In production, price your products in NGN
  const amountInKobo = Math.round(total * 100);

  const handler = PaystackPop.setup({
    key:    "pk_test_48ba6ccaa99252dd5419e09404b48af0271d74b7",
    email,
    amount: amountInKobo,
    currency: "NGN",
    ref: `wheeze_${Date.now()}`,
    metadata: {
      custom_fields: [
        { display_name: "Customer Name",    variable_name: "customer_name",    value: name },
        { display_name: "Delivery Address", variable_name: "delivery_address", value: address }
      ]
    },
    callback: async function (response) {
      // Payment successful — save order to Firestore
      try {
        const userId = currentUser ? currentUser.uid : "guest";
        await saveOrder(userId, cart, total, { name, email, address });
      } catch (err) {
        console.error("Order save failed:", err);
      }

      localStorage.removeItem("cart");
      showToast("Payment successful! 🎉", "success");
      setTimeout(() => location.href = "success.html", 1200);
    },
    onClose: function () {
      showToast("Payment cancelled.", "error");
    }
  });

  handler.openIframe();
};
