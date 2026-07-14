import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAh9Tuv4Mj5mlAeXKupQApFDw0e1QO-Pbw",
  authDomain: "wheeze-app.firebaseapp.com",
  databaseURL: "https://wheeze-app-default-rtdb.firebaseio.com",
  projectId: "wheeze-app",
  storageBucket: "wheeze-app.firebasestorage.app",
  messagingSenderId: "704631114508",
  appId: "1:704631114508:web:ce0d012d3cc3c04c69d729",
  measurementId: "G-89KMW1C9KG"
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// Disable reCAPTCHA Enterprise — fixes 400 Bad Request on login
auth.settings = auth.settings || {};
auth.settings.appVerificationDisabledForTesting = false;

// ── AUTH HELPERS ──────────────────────────────────────
export async function signUp(email, password, username) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", cred.user.uid), {
    username,
    email,
    createdAt: serverTimestamp()
  });
  return cred.user;
}

export async function logIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logOut() {
  await signOut(auth);
}

// ── ORDERS ────────────────────────────────────────────
export async function saveOrder(userId, cart, total, customerDetails) {
  await addDoc(collection(db, "orders"), {
    userId,
    customerDetails,
    items: cart,
    total,
    status: "paid",
    createdAt: serverTimestamp()
  });
}

// ── AUTH STATE LISTENER ───────────────────────────────
export function watchAuth(callback) {
  onAuthStateChanged(auth, callback);
}
