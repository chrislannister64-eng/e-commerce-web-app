import { signUp, logIn, watchAuth } from "./firebase.js";

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

// ── SIGNUP ────────────────────────────────────────────
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("new-username").value.trim();
    const email    = document.getElementById("new-email").value.trim();
    const password = document.getElementById("new-password").value.trim();
    if (!username || !email || !password) { showToast("Please fill in all fields.", "error"); return; }
    if (password.length < 6) { showToast("Password must be at least 6 characters.", "error"); return; }
    const btn = signupForm.querySelector("button[type=submit]");
    btn.textContent = "Creating account..."; btn.disabled = true;
    try {
      await signUp(email, password, username);
      showToast("Account created! Welcome to Wheeze 🎉", "success");
      setTimeout(() => location.href = "index.html", 1500);
    } catch (err) {
      btn.textContent = "Sign Up"; btn.disabled = false;
      showToast(err.code === "auth/email-already-in-use" ? "That email is already registered." : err.message, "error");
    }
  });
}

// ── LOGIN ─────────────────────────────────────────────
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!email || !password) { showToast("Please fill in all fields.", "error"); return; }
    const btn = loginForm.querySelector("button[type=submit]");
    btn.textContent = "Logging in..."; btn.disabled = true;
    try {
      const user = await logIn(email, password);
      const username = user.email.split("@")[0];
      localStorage.setItem("wheeze_username", username);
      showToast(`Welcome back, ${username}! 👋`, "success");
      setTimeout(() => location.href = "index.html", 1500);
    } catch (err) {
      btn.textContent = "Login"; btn.disabled = false;
      showToast("Invalid email or password.", "error");
    }
  });
}

// ── NAV STATE (login/signup pages only) ───────────────
watchAuth((user) => {
  if (user && (window.location.pathname.includes("login") || window.location.pathname.includes("signup"))) {
    location.href = "index.html";
  }
});
