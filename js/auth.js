import { signUp, logIn, logOut, watchAuth } from "./firebase.js";

// ── SIGNUP ────────────────────────────────────────────
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("new-username").value.trim();
    const email    = document.getElementById("new-email").value.trim();
    const password = document.getElementById("new-password").value.trim();

    if (!username || !email || !password) {
      showToast("Please fill in all fields.", "error"); return;
    }
    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "error"); return;
    }

    const btn = signupForm.querySelector("button[type=submit]");
    btn.textContent = "Creating account...";
    btn.disabled = true;

    try {
      await signUp(email, password, username);
      showToast("Account created! Welcome to Wheeze.", "success");
      setTimeout(() => location.href = "wheeze.html", 1200);
    } catch (err) {
      btn.textContent = "Sign Up";
      btn.disabled = false;
      if (err.code === "auth/email-already-in-use") {
        showToast("That email is already registered.", "error");
      } else {
        showToast(err.message, "error");
      }
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

    if (!email || !password) {
      showToast("Please fill in all fields.", "error"); return;
    }

    const btn = loginForm.querySelector("button[type=submit]");
    btn.textContent = "Logging in...";
    btn.disabled = true;

    try {
      await logIn(email, password);
      showToast("Welcome back!", "success");
      setTimeout(() => location.href = "wheeze.html", 1000);
    } catch (err) {
      btn.textContent = "Login";
      btn.disabled = false;
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        showToast("Invalid email or password.", "error");
      } else {
        showToast(err.message, "error");
      }
    }
  });
}

// ── LOGOUT (called from nav) ──────────────────────────
window.logout = async function () {
  await logOut();
  localStorage.removeItem("cart");
  location.href = "wheeze.html";
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
